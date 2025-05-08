
#define LGFX_USE_V1

#include "esp_log.h"

const static char* TAG = "LGFX";

#include <LovyanGFX.hpp>

#include "LGFX_QemuRGB.hpp"

extern "C" {
    #include "cglp_duk.h"
    #include "esp_lcd_panel_interface.h"
    #include "esp_lcd_panel_ops.h"
    #include "esp_lcd_qemu_rgb.h"
    }

// The pixel number in horizontal and vertical
#define EXAMPLE_LCD_H_RES 320
#define EXAMPLE_LCD_V_RES 240
#define CURRENT_COLOR_DEPTH RGB_QEMU_BPP_16


LGFX_QemuRGB::Panel_QemuRGB::Panel_QemuRGB() {
    ESP_LOGI(TAG, "Install RGB LCD panel driver");
    esp_lcd_rgb_qemu_config_t panel_config = {
        .width = EXAMPLE_LCD_H_RES,
        .height = EXAMPLE_LCD_V_RES,
        .bpp = CURRENT_COLOR_DEPTH,
    };
    ESP_ERROR_CHECK(esp_lcd_new_rgb_qemu(&panel_config, &_panel));

    ESP_LOGI(TAG, "Initialize RGB LCD panel");
    ESP_ERROR_CHECK(esp_lcd_panel_reset(_panel));
    ESP_ERROR_CHECK(esp_lcd_panel_init(_panel));

    _cfg.panel_width = EXAMPLE_LCD_H_RES;
    _cfg.panel_height = EXAMPLE_LCD_V_RES;
    _cfg.offset_x = 0;
    _cfg.offset_y = 0;
    _cfg.offset_rotation = 0;
    _cfg.rgb_order = false;
    _cfg.invert = false;
    _cfg.bus_shared = false;
  }

  void LGFX_QemuRGB::Panel_QemuRGB::drawPixelPreclipped(uint_fast16_t x, uint_fast16_t y, uint32_t rawcolor) {
    ESP_LOGI(TAG, "drawPixelPreclipped");
    uint16_t color = rawcolor;
    _panel->draw_bitmap(_panel, x, y, x + 1, y + 1, &color);
  }

  void LGFX_QemuRGB::Panel_QemuRGB::setWindow(uint_fast16_t xs, uint_fast16_t ys, uint_fast16_t xe, uint_fast16_t ye) {
    ESP_LOGI(TAG, "setWindow");
    _xs = xs;
    _ys = ys;
    _xe = xe;
    _ye = ye;
  }

  void LGFX_QemuRGB::Panel_QemuRGB::writeBlock(uint32_t rawcolor, uint32_t length) {
    ESP_LOGI(TAG, "writeBlock");
    uint16_t color = rawcolor;
    int width = _xe - _xs + 1;
    int height = _ye - _ys + 1;

    static std::vector<uint16_t> fillbuf;
    if (fillbuf.size() < static_cast<size_t>(length)) {
      fillbuf.resize(length);
    }
    std::fill_n(fillbuf.data(), length, color);
    _panel->draw_bitmap(_panel, _xs, _ys, _xe + 1, _ye + 1, fillbuf.data());
  }

  LGFX_QemuRGB::LGFX_QemuRGB() : _panel_instance() {
    setPanel(&_panel_instance);
  }