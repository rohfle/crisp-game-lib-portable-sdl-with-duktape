#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>
#include <fcntl.h>

#include "driver/gpio.h"
#include "driver/uart.h"
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
#include "cglp_duk_native.h"
}

const static char* TAG = "cglp";


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
                  // ESP_LOGI("cglp", "md_drawRect");
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
                        // ESP_LOGI("cglp", "md_drawCharacter");
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
  // ESP_LOGI("cglp", "md_clearView r=0x%02x g=0x%02x b=0x%02x", r, g, b);
  canvas.fillSprite(lcd.color565(r, g, b));
}

void md_clearScreen(unsigned char r, unsigned char g, unsigned char b) {
  // ESP_LOGI("cglp", "md_clearScreen");
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
  lcd.setDimensions(w, h);
  if (isCanvasCreated) {
    canvas.deleteSprite();
  }
  isCanvasCreated = true;
  canvas.createSprite(w, h);
  canvasX = (lcd.width() - w) / 2;
  canvasY = (lcd.height() - h) / 2;
  resetCharacterSprite();
}

static TaskHandle_t frameTaskHandle;

static bool ba;
static bool bb;
static bool bleft, bright, bup, bdown;

static void updateFromFrameTask() {
  setButtonState(bleft, bright, bup, bdown, bb, ba);
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
      ESP_LOGI("MONITOR", "Free heap: %lu bytes, ticks=%i", esp_get_free_heap_size(), ticks);
      vTaskDelay(pdMS_TO_TICKS(10000));  // Delay 10 second
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

void initTimers() {
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

    BaseType_t result = xTaskCreatePinnedToCore(updateFrameTask, "updateFrameTask", 8192, NULL, 1, &frameTaskHandle, APP_CPU_NUM);
    if (result != pdPASS) {
      ESP_LOGE(TAG, "updateFrameTask task aint pinning: result=%d", result);
    }
    result = xTaskCreatePinnedToCore(updateSoundTask, "updateSoundTask", 8192, NULL, 2, &soundTaskHandle, PRO_CPU_NUM);
    if (result != pdPASS) {
      ESP_LOGE(TAG, "updateSoundTask task aint pinning: result=%d", result);
    }
}


extern "C" void app_main(void) {
  xTaskCreate(ram_monitor_task, "ram_monitor", 2048, NULL, 5, NULL);
  lcd.init();
  initCharacterSprite();
  initSoundTones();
  disableSound();
  initGame();
  initTimers();

  #define UART1_BAUD_RATE     115200
  #define UART1_BUFFER_SIZE   1024

      // Configure UART1 parameters
      uart_config_t uart_config = {
          .baud_rate = UART1_BAUD_RATE,
          .data_bits = UART_DATA_8_BITS,
          .parity = UART_PARITY_DISABLE,
          .stop_bits = UART_STOP_BITS_1,
          .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
      };

      // Install UART driver
      uart_driver_install(UART_NUM_1, UART1_BUFFER_SIZE, 0, 0, NULL, 0);
      uart_param_config(UART_NUM_1, &uart_config);
      uart_set_pin(UART_NUM_1, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);

      // Send data
      #define READBUF_LEN 16
      char readbuf[READBUF_LEN] = {0};

      // Loop to keep the task running
      while (1) {
        int len = uart_read_bytes(UART_NUM_1, readbuf, READBUF_LEN, 10 / portTICK_PERIOD_MS);
        if (len == 0) {
          continue;
        } else if (len < 0) {
          ESP_LOGE("UART2", "uart_read_bytes returned error %d", len);
          return;
        } else {
          for (int i = 0; i < len; i++) {
            switch(readbuf[i]) {
              case 'A':
              case 'a':
                ba = (readbuf[i] == 'A');
                break;
              case 'B':
              case 'b':
                bb = (readbuf[i] == 'B');
                break;
              case 'U':
              case 'u':
                bup = (readbuf[i] == 'U');
                break;
              case 'L':
              case 'l':
                bleft = (readbuf[i] == 'L');
                break;
              case 'D':
              case 'd':
                bdown = (readbuf[i] == 'D');
                break;
              case 'R':
              case 'r':
                bright = (readbuf[i] == 'R');
                break;
              case 'E':
              case 'e':
                if (!isInMenu) goToMenu();
                break;
            }
          }

          ESP_LOGI("UART2", "got button state A=%d B=%d", ba, bb);
        }
      }

}

