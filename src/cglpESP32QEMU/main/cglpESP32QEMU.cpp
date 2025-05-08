#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>
#include <fcntl.h>

#include "driver/gpio.h"
#include "esp_err.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_qemu_rgb.h"
#include "esp_littlefs.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "freertos/task.h"
#include "sdkconfig.h"

#include "driver/gptimer.h"

#include "LGFX_QemuRGB.hpp"

#include <float.h>

#include <LovyanGFX.hpp>

#include "cglp.h"
#include "machineDependent.h"
extern "C" {
#include "cglp_duk.h"
}

#define GAMES_DIRECTORY "/games"

const static char* TAG = "cglp";

int init_storage() {
  ESP_LOGI(TAG, "Initializing LittleFS");

  esp_vfs_littlefs_conf_t conf = {
      .base_path = GAMES_DIRECTORY,
      .partition_label = "games",
      .partition = NULL,
      .format_if_mount_failed = false,
      .read_only = true,
      .dont_mount = false,
      .grow_on_mount = false,
  };

  // Use settings defined above to initialize and mount LittleFS filesystem.
  // Note: esp_vfs_littlefs_register is an all-in-one convenience function.
  esp_err_t ret = esp_vfs_littlefs_register(&conf);

  if (ret != ESP_OK) {
    if (ret == ESP_FAIL) {
      ESP_LOGE(TAG, "Failed to mount or format filesystem");
    } else if (ret == ESP_ERR_NOT_FOUND) {
      ESP_LOGE(TAG, "Failed to find LittleFS partition");
    } else {
      ESP_LOGE(TAG, "Failed to initialize LittleFS (%s)", esp_err_to_name(ret));
    }
    return ret;
  }

  size_t total = 0, used = 0;
  ret = esp_littlefs_info(conf.partition_label, &total, &used);
  if (ret != ESP_OK) {
    ESP_LOGE(TAG, "Failed to get LittleFS partition information (%s)",
             esp_err_to_name(ret));
    esp_littlefs_format(conf.partition_label);
  } else {
    ESP_LOGI(TAG, "Partition size: total: %d, used: %d", total, used);
  }
  return ret;
}

// copy pasted from SDL2
int filename_compare(const void *a, const void *b) {
  const char **str1 = (const char **)a;
  const char **str2 = (const char **)b;

  #ifdef _WIN32
      return _stricmp(*str1, *str2);
  #else
      return strcasecmp(*str1, *str2);
  #endif
}

// TODO: move to library, use include / makefiles
int md_readJSGame(char *filename, char *buf, int buflen) {
  buflen -= 1;  // allow for space for null termination

  const int PATHBUF_MAX_LENGTH = 100;
  char pathbuf[PATHBUF_MAX_LENGTH + 1] = GAMES_DIRECTORY "/";
  strncat(pathbuf, filename, PATHBUF_MAX_LENGTH - strlen(pathbuf));
  pathbuf[PATHBUF_MAX_LENGTH] = '\0';

  FILE *f = fopen(pathbuf, "rb");
  if (f == NULL) {
    ESP_LOGE(TAG, "fdopen: Error opening game %s: error %d\n", filename, errno);
    return -1;
  }
  size_t len = fread((void *)buf, 1, buflen, f);
  if (!feof(f) && ferror(f)) {
    buf[0] = '\0';  // return zero length string
    ESP_LOGE(TAG, "fread: Error reading game %s\n", filename);
    return -1;
  }
  if (!feof(f)) {
    ESP_LOGE(TAG, "fread: Game is too big: over %d bytes %s\n", buflen, filename);
    return -1;
  }
  buf[len] = '\0';  // ensure null termination
  fclose(f);
  return len;
}

void md_loadJSGames() {
  char *filenames[MAX_GAME_COUNT];
  int filenameCount = 0;

  DIR *directory = opendir(GAMES_DIRECTORY);
  if (directory == NULL) {
    ESP_LOGE(TAG, "opendir: Error opening directory %s: error %d\n", GAMES_DIRECTORY,
             errno);
    return;
  }

  struct dirent *entry = NULL;

  while ((entry = readdir(directory)) != NULL) {
    char *name = entry->d_name;
    if (name[0] == '.') {
      continue;
    }
    int len = strlen(name);
    if (name[len - 3] != '.' || name[len - 2] != 'j' || name[len - 1] != 's') {
      continue;
    }
    filenames[filenameCount++] = strdup(name);
    if (filenameCount >= MAX_GAME_COUNT) {
      ESP_LOGW(TAG,
          "md_loadJSGames: Stopped loading after reaching game limit of %d\n",
          MAX_GAME_COUNT);
      break;
    }
  }
  closedir(directory);
  // sort filenames
  qsort(filenames, filenameCount, sizeof(char *), filename_compare);
  // then add the games
  for (int i = 0; i < filenameCount; i++) {
    int res = addJSGameFromFile(filenames[i]);
    // TODO: handle error
  }

  ESP_LOGI(TAG, "loaded %i games\n", filenameCount);
}


static LGFX_QemuRGB lcd;
static LGFX_Sprite canvas(&lcd);
static bool isCanvasCreated = false;
static int canvasX;
static int canvasY;

typedef struct {
  float freq;
  float duration;
  float when;
} SoundTone;

#define TONE_PER_NOTE 32
#define SOUND_TONE_COUNT 64
static SoundTone soundTones[SOUND_TONE_COUNT];
static int soundToneIndex = 0;
static float soundTime = 0;

static void initSoundTones() {
  for (int i = 0; i < SOUND_TONE_COUNT; i++) {
    soundTones[i].when = FLT_MAX;
  }
}

static void addSoundTone(float freq, float duration, float when) {
  SoundTone *st = &soundTones[soundToneIndex];
  st->freq = freq;
  st->duration = duration;
  st->when = when;
  soundToneIndex++;
  if (soundToneIndex >= SOUND_TONE_COUNT) {
    soundToneIndex = 0;
  }
}

void md_drawRect(float x, float y, float w, float h, unsigned char r,
                 unsigned char g, unsigned char b) {
                  ESP_LOGI("cglp", "md_drawRect");
  canvas.fillRect((int)x, (int)y, (int)w, (int)h, lcd.color565(r, g, b));
}

#define TRANSPARENT_COLOR 0

typedef struct {
  LGFX_Sprite *sprite;
  int hash;
} CharaterSprite;

static CharaterSprite characterSprites[MAX_CACHED_CHARACTER_PATTERN_COUNT];
static int characterSpritesCount;

static void initCharacterSprite() {
  for (int i = 0; i < MAX_CACHED_CHARACTER_PATTERN_COUNT; i++) {
    characterSprites[i].sprite = new LGFX_Sprite(&canvas);
  }
  characterSpritesCount = 0;
}

static void resetCharacterSprite() {
  for (int i = 0; i < characterSpritesCount; i++) {
    characterSprites[i].sprite->deleteSprite();
  }
  characterSpritesCount = 0;
}

static uint16_t characterImageData[CHARACTER_WIDTH * CHARACTER_HEIGHT];

static void createCharacterImageData(
    unsigned char grid[CHARACTER_HEIGHT][CHARACTER_WIDTH][3]) {
  int cp = 0;
  for (int y = 0; y < CHARACTER_HEIGHT; y++) {
    for (int x = 0; x < CHARACTER_WIDTH; x++) {
      unsigned char r = grid[y][x][0];
      unsigned char g = grid[y][x][1];
      unsigned char b = grid[y][x][2];
      characterImageData[cp] =
          (r > 0 || g > 0 || b > 0) ? lcd.color565(r, g, b) : TRANSPARENT_COLOR;
      cp++;
    }
  }
}

void md_drawCharacter(unsigned char grid[CHARACTER_HEIGHT][CHARACTER_WIDTH][3],
                      float x, float y, int hash) {
                        ESP_LOGI("cglp", "md_drawCharacter");
  CharaterSprite *cp = NULL;
  for (int i = 0; i < characterSpritesCount; i++) {
    if (characterSprites[i].hash == hash) {
      cp = &characterSprites[i];
      break;
    }
  }
  if (cp == NULL) {
    cp = &characterSprites[characterSpritesCount];
    cp->hash = hash;
    createCharacterImageData(grid);
    cp->sprite->createSprite(CHARACTER_WIDTH, CHARACTER_HEIGHT);
    cp->sprite->setSwapBytes(true);
    cp->sprite->pushImage(0, 0, CHARACTER_WIDTH, CHARACTER_HEIGHT,
                          characterImageData);
    characterSpritesCount++;
  }
  cp->sprite->pushSprite((int)x, (int)y, TRANSPARENT_COLOR);
}

void md_clearView(unsigned char r, unsigned char g, unsigned char b) {
  canvas.fillSprite(lcd.color565(r, g, b));
}

void md_clearScreen(unsigned char r, unsigned char g, unsigned char b) {
  lcd.fillScreen(lcd.color565(r, g, b));
}

void md_playTone(float freq, float duration, float when) {
  addSoundTone(freq, duration, when);
}

void md_stopTone() {
  initSoundTones();
  // M5.Beep.mute();
}

float md_getAudioTime() { return soundTime; }

void md_consoleLog(char *msg) {
  ESP_LOGE(TAG, "%s", msg);
}

void md_initView(int w, int h) {
  if (isCanvasCreated) {
    canvas.deleteSprite();
  }
  isCanvasCreated = true;
  canvas.createSprite(w, h);
  if (w > 135) {
    lcd.setRotation(1);
  } else {
    lcd.setRotation(0);
  }
  canvasX = (lcd.width() - w) / 2;
  canvasY = (lcd.height() - h) / 2;
  resetCharacterSprite();
}

static TaskHandle_t frameTaskHandle;

static void updateFromFrameTask() {
  // TODO: buttons
  bool ba = false; // !lgfx::gpio_in(BUTTON_A_PIN);
  bool bb = false; // !lgfx::gpio_in(BUTTON_B_PIN);
  setButtonState(false, false, false, false, bb, ba);
  updateFrame();
  lcd.startWrite();
  canvas.pushSprite(canvasX, canvasY);
  lcd.endWrite();
  if (!isInMenu) {
    if (currentInput.b.isJustPressed) {
      if (currentInput.a.isPressed) {
        goToMenu();
      } else {
        toggleSound();
      }
    }
  }
}

static void updateFrameTask(void *pvParameters) {
  while (1) {
    xTaskNotifyWait(0, 0, NULL, portMAX_DELAY);
    updateFromFrameTask();
  }
}

static TaskHandle_t soundTaskHandle;

static void updateFromSoundTask() {
  // M5.Beep.update();
  soundTime += 60 / tempo / TONE_PER_NOTE;
  float lastWhen = 0;
  int ti = -1;
  for (int i = 0; i < SOUND_TONE_COUNT; i++) {
    SoundTone *st = &soundTones[i];
    if (st->when <= soundTime) {
      if (st->when > lastWhen) {
        ti = i;
        lastWhen = st->when;
        st->when = FLT_MAX;
      }
    }
  }
  if (ti >= 0) {
    SoundTone *st = &soundTones[ti];
    //   M5.Beep.tone((uint16_t)st->freq, (uint32_t)(st->duration * 1000));
  }
}

static void updateSoundTask(void *pvParameters) {
  while (1) {
    xTaskNotifyWait(0, 0, NULL, portMAX_DELAY);
    updateFromSoundTask();
  }
}

void ram_monitor_task(void *arg) {
  while (true) {
      ESP_LOGI("MONITOR", "Free heap: %lu bytes", esp_get_free_heap_size());
      vTaskDelay(pdMS_TO_TICKS(1000));  // Delay 1 second
  }
}


static gptimer_handle_t frame_timer = NULL;
static gptimer_handle_t sound_timer = NULL;

static bool IRAM_ATTR onFrameTimer(gptimer_handle_t timer, const gptimer_alarm_event_data_t *edata, void *user_data) {
    xTaskNotifyFromISR(frameTaskHandle, 0, eIncrement, NULL);
    return pdFALSE;
}

static bool IRAM_ATTR onSoundTimer(gptimer_handle_t timer, const gptimer_alarm_event_data_t *edata, void *user_data) {
    xTaskNotifyFromISR(soundTaskHandle, 0, eIncrement, NULL);
    return pdFALSE;
}

void init_timers() {
    // === Frame Timer ===
    gptimer_config_t frame_cfg = {
        .clk_src = GPTIMER_CLK_SRC_APB,
        .direction = GPTIMER_COUNT_UP,
        .resolution_hz = 1000000, // 1 tick = 1 microsecond
    };
    ESP_ERROR_CHECK(gptimer_new_timer(&frame_cfg, &frame_timer));

    gptimer_event_callbacks_t frame_cbs = {
        .on_alarm = onFrameTimer
    };
    ESP_ERROR_CHECK(gptimer_register_event_callbacks(frame_timer, &frame_cbs, NULL));

    uint64_t frame_interval_us = 1000000 / FPS;

    gptimer_alarm_config_t frame_alarm = {
        .alarm_count = frame_interval_us,
        .reload_count = 0,
        .flags = {
          .auto_reload_on_alarm = true
        },
    };
    ESP_ERROR_CHECK(gptimer_set_alarm_action(frame_timer, &frame_alarm));
    ESP_ERROR_CHECK(gptimer_enable(frame_timer));
    ESP_ERROR_CHECK(gptimer_start(frame_timer));

    // === Sound Timer ===
    gptimer_config_t sound_cfg = {
        .clk_src = GPTIMER_CLK_SRC_APB,
        .direction = GPTIMER_COUNT_UP,
        .resolution_hz = 1000000, // 1 tick = 1 microsecond
    };
    ESP_ERROR_CHECK(gptimer_new_timer(&sound_cfg, &sound_timer));

    gptimer_event_callbacks_t sound_cbs = {
        .on_alarm = onSoundTimer,
    };
    ESP_ERROR_CHECK(gptimer_register_event_callbacks(sound_timer, &sound_cbs, NULL));

    float interval_us = (60.0f / tempo / TONE_PER_NOTE) * 1000000;

    gptimer_alarm_config_t sound_alarm = {
        .alarm_count = (uint64_t)interval_us,
        .reload_count = 0,
        .flags = {
          .auto_reload_on_alarm = true
        },
    };
    ESP_ERROR_CHECK(gptimer_set_alarm_action(sound_timer, &sound_alarm));
    ESP_ERROR_CHECK(gptimer_enable(sound_timer));
    ESP_ERROR_CHECK(gptimer_start(sound_timer));

    // === Tasks ===
    xTaskCreatePinnedToCore(updateFrameTask, "updateFrameTask", 8192, NULL, 1, &frameTaskHandle, APP_CPU_NUM);
    xTaskCreatePinnedToCore(updateSoundTask, "updateSoundTask", 8192, NULL, 2, &soundTaskHandle, PRO_CPU_NUM);
}


extern "C" void app_main(void) {
  xTaskCreate(ram_monitor_task, "ram_monitor", 2048, NULL, 5, NULL);

  init_storage();
  ESP_LOGI(TAG, "got to here");
  lcd.init();
  lcd.setRotation(0);
  lcd.setBrightness(128);
  lcd._panel_instance.drawPixelPreclipped(10, 10, lcd.color565(31, 0, 0));

  lcd._panel_instance.setWindow(10, 10, 20, 20);
  lcd._panel_instance.writeBlock(lcd.color565(0, 63, 0), 100);

  vTaskDelay(pdMS_TO_TICKS(5000));
  lcd.fillScreen(lcd.color565(31, 0, 0));
  vTaskDelay(pdMS_TO_TICKS(5000));
  canvas.fillSprite(lcd.color565(0, 63, 0));
  vTaskDelay(pdMS_TO_TICKS(5000));
  // ESP_LOGI(TAG, "got to here");
  // initCharacterSprite();
  // initSoundTones();
  // ESP_LOGI(TAG, "got to here");
  // disableSound();
  // initGame();

  // ESP_LOGI(TAG, "got to here");


  // hw_timer_t *frameTimer = NULL;
  // frameTimer = timerBegin(0, getApbFrequency() / FPS / 1000, true);
  // timerAttachInterrupt(frameTimer, &onFrameTimer, true);
  // timerAlarmWrite(frameTimer, 1000, true);
  // timerAlarmEnable(frameTimer);



  // xTaskCreateUniversal(updateFrameTask, "updateFrameTask", 8192, NULL, 1,
  //                      &frameTaskHandle, APP_CPU_NUM);


  // hw_timer_t *soundTimer = NULL;
  // soundTimer = timerBegin(
  //     1, getApbFrequency() * (60.0f / tempo / TONE_PER_NOTE) / 1000, true);
  // timerAttachInterrupt(soundTimer, &onSoundTimer, true);
  // timerAlarmWrite(soundTimer, 1000, true);
  // timerAlarmEnable(soundTimer);


  // xTaskCreateUniversal(updateSoundTask, "updateSoundTask", 8192, NULL, 2,
  //                      &soundTaskHandle, PRO_CPU_NUM);

  // gptimer_config_t frame_cfg = {
  //   .clk_src = GPTIMER_CLK_SRC_APB,
  //   .direction = GPTIMER_COUNT_UP,
  //   .resolution_hz = 1000000, // 1 tick = 1 microsecond
  // };
  // ESP_ERROR_CHECK(gptimer_new_timer(&frame_cfg, &frame_timer));


  // #define APB_FREQUENCY 80000000
  // // === Frame Timer ===
  // timer_config_t frame_timer_config = {
  //   .alarm_en = TIMER_ALARM_EN,
  //   .counter_en = TIMER_PAUSE,
  //   .counter_dir = TIMER_COUNT_UP,
  //   .auto_reload = TIMER_AUTORELOAD_EN,
  //   .divider = APB_FREQUENCY / FPS / 1000,
  // };
  // timer_init(TIMER_GROUP_0, TIMER_0, &frame_timer_config);
  // timer_set_alarm_value(TIMER_GROUP_0, TIMER_0, 1000);
  // timer_enable_intr(TIMER_GROUP_0, TIMER_0);
  // timer_isr_register(TIMER_GROUP_0, TIMER_0, onFrameTimer, NULL, ESP_INTR_FLAG_IRAM, NULL);
  // timer_start(TIMER_GROUP_0, TIMER_0);

  // // === Sound Timer ===
  // timer_config_t sound_timer_config = {
  //   .alarm_en = TIMER_ALARM_EN,
  //   .counter_en = TIMER_PAUSE,
  //   .counter_dir = TIMER_COUNT_UP,
  //   .auto_reload = TIMER_AUTORELOAD_EN,
  //   .divider = (uint32_t)(APB_FREQUENCY * (60.0f / tempo / TONE_PER_NOTE) / 1000),
  // };
  // timer_init(TIMER_GROUP_0, TIMER_1, &sound_timer_config);
  // timer_set_alarm_value(TIMER_GROUP_0, TIMER_1, 1000);
  // timer_enable_intr(TIMER_GROUP_0, TIMER_1);
  // timer_isr_register(TIMER_GROUP_0, TIMER_1, onSoundTimer, NULL, ESP_INTR_FLAG_IRAM, NULL);
  // timer_start(TIMER_GROUP_0, TIMER_1);

  // init_timers();

  // // === Tasks ===
  // xTaskCreatePinnedToCore(updateFrameTask, "updateFrameTask", 8192, NULL, 1, NULL, APP_CPU_NUM);
  // xTaskCreatePinnedToCore(updateSoundTask, "updateSoundTask", 8192, NULL, 2, NULL, PRO_CPU_NUM);

}
