
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
    #include "esp_debug_helpers.h"
}


// functions that dont need to be completed
Panel_QemuRGB::Panel_QemuRGB() {}
void Panel_QemuRGB::setInvert(bool invert) {}
void Panel_QemuRGB::setSleep(bool flg) {}
void Panel_QemuRGB::setPowerSave(bool) {}
void Panel_QemuRGB::waitDisplay(void) {}
bool Panel_QemuRGB::displayBusy(void) { return false; }
uint32_t Panel_QemuRGB::readCommand(uint_fast16_t cmd, uint_fast8_t index, uint_fast8_t len) { return 0; }
uint32_t Panel_QemuRGB::readData(uint_fast8_t index, uint_fast8_t len) { return 0; }
void Panel_QemuRGB::readRect(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h, void* dst, pixelcopy_t* param) {}
void Panel_QemuRGB::beginTransaction(void) {}
void Panel_QemuRGB::endTransaction(void) {}
void Panel_QemuRGB::display(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h) {}

void Panel_QemuRGB::setDimensions(int width, int height) {
    _width = width;
    _height = height;
    init(true);
}

bool Panel_QemuRGB::init(bool use_reset)
{
    if (_panel != NULL) {
        esp_lcd_panel_del(_panel);
        _panel = NULL;
    }

    esp_lcd_rgb_qemu_bpp_t qemu_bpp;
    switch (_write_depth) {
        case rgb565_2Byte:
            qemu_bpp = RGB_QEMU_BPP_16;
            break;
        default:
            ESP_LOGE(TAG, "Bit depth %u not supported by qemu", _write_depth);
            return false;
    }

    ESP_LOGI(TAG, "Install RGB LCD panel driver width=%u, height=%u, depth=%u", _width, _height, qemu_bpp);
    esp_lcd_rgb_qemu_config_t panel_config = {
        .width = _width,
        .height = _height,
        .bpp = qemu_bpp,
    };
    ESP_ERROR_CHECK(esp_lcd_new_rgb_qemu(&panel_config, &_panel));
    ESP_LOGI(TAG, "Initialize RGB LCD panel");
    ESP_ERROR_CHECK(esp_lcd_panel_reset(_panel));
    ESP_ERROR_CHECK(esp_lcd_panel_init(_panel));

  return Panel_Device::init(use_reset);
}

color_depth_t Panel_QemuRGB::setColorDepth(color_depth_t depth) {
    _write_depth = depth;
    _read_depth = depth;
    return depth;
}

void Panel_QemuRGB::setRotation(uint_fast8_t r){
    // rotation unsupported
    _rotation = 0;
    _internal_rotation = ((r + _cfg.offset_rotation) & 3) | ((r & 4) ^ (_cfg.offset_rotation & 4));
    _width  = _cfg.panel_width;
    _height = _cfg.panel_height;
}

void Panel_QemuRGB::writeBlock(uint32_t rawcolor, uint32_t length){
    ESP_LOGI("cglp", "- Panel_QemuRGB::writeBlock");
    do {
      uint32_t h = 1;
      auto w = std::min<uint32_t>(length, _xe + 1 - _xpos);
      if (length >= (w << 1) && _xpos == _xs)
      {
        h = std::min<uint32_t>(length / w, _ye + 1 - _ypos);
      }
      writeFillRectPreclipped(_xpos, _ypos, w, h, rawcolor);
      if ((_xpos += w) <= _xe) return;
      _xpos = _xs;
      if (_ye < (_ypos += h)) { _ypos = _ys; }
      length -= w * h;
    } while (length);
}

void Panel_QemuRGB::setWindow(uint_fast16_t xs, uint_fast16_t ys, uint_fast16_t xe, uint_fast16_t ye){
    ESP_LOGI("cglp", "- Panel_QemuRGB::setWindow");
    _xs = std::max<unsigned long>(0u, std::min<uint_fast16_t>(_width  - 1, xs));
    _xe = std::max<unsigned long>(0u, std::min<uint_fast16_t>(_width  - 1, xe));
    _ys = std::max<unsigned long>(0u, std::min<uint_fast16_t>(_height - 1, ys));
    _ye = std::max<unsigned long>(0u, std::min<uint_fast16_t>(_height - 1, ye));
}

void Panel_QemuRGB::drawPixelPreclipped(uint_fast16_t x, uint_fast16_t y, uint32_t rawcolor){
    ESP_LOGI("cglp", "- Panel_QemuRGB::drawPixelPreclipped");
    if (_write_depth != rgb565_2Byte) {
        return;
    }

    void* fb;
    esp_lcd_rgb_qemu_get_frame_buffer(_panel, &fb);

    uint16_t* framebuffer = (uint16_t*)fb;

    uint16_t c = ((rawcolor >> 8) & 0xFF) | ((rawcolor << 8) & 0xFF00);
    framebuffer[y * _width + x] = c;
}
void Panel_QemuRGB::writeFillRectPreclipped(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h, uint32_t rawcolor){
    // ESP_LOGI("cglp", "- Panel_QemuRGB::writeFillRectPreclipped");
    if (_write_depth != rgb565_2Byte) {
        return;
    }

    void* fb;
    esp_lcd_rgb_qemu_get_frame_buffer(_panel, &fb);

    uint16_t* framebuffer = (uint16_t*)fb;

    uint16_t c = ((rawcolor >> 8) & 0xFF) | ((rawcolor << 8) & 0xFF00);

    for (int iy = y; iy <= y+h; iy++) {
        int yoff = iy * _width;
        for (int ix = x; ix <= x+w; ix++) {
            framebuffer[yoff + ix] = c;
        }
    }

    esp_lcd_rgb_qemu_refresh(_panel);
}

void Panel_QemuRGB::writePixels(pixelcopy_t* param, uint32_t len, bool use_dma){
    ESP_LOGI("cglp", "- Panel_QemuRGB::writePixels");
    if (_write_depth != rgb565_2Byte || len == 0) {
        return;
    }

    void* fb;
    esp_lcd_rgb_qemu_get_frame_buffer(_panel, &fb);

    uint32_t* framebuffer = (uint32_t*)fb;
    const uint16_t* src = (const uint16_t*)param->src_data;

    int idx = 0;
    for (int iy = _ys; iy <= _ye; iy++) {
        int yoff = iy * _width;
        for (int ix = _xs; ix <= _xe; ix++) {
            auto c = (src[idx] >> 8) | (src[idx] << 8);
            framebuffer[yoff + ix] = c;
            idx += 1;
            if (idx >= len) {
                esp_lcd_rgb_qemu_refresh(_panel);
                return;
            }
        }
    }

    esp_lcd_rgb_qemu_refresh(_panel);
    return;
}

void Panel_QemuRGB::writeImage(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h, pixelcopy_t* param, bool use_dma){
    // ESP_LOGI("cglp", "- Panel_QemuRGB::writeImage x=%u y=%u w=%u h=%u", x, y, w, h);
    if (_write_depth != rgb565_2Byte) {
        return;
    }

    void* fb;
    esp_lcd_rgb_qemu_get_frame_buffer(_panel, &fb);

    uint16_t* framebuffer = (uint16_t*)fb;
    const uint16_t* src = (const uint16_t*)param->src_data;

    int idx = 0;
    for (int iy = y; iy < y+h; iy++) {
        int yoff = iy * _width;
        for (int ix = x; ix < x+w; ix++) {
            // byte order is wrong
            auto c = (src[idx] >> 8) | (src[idx] << 8);
            framebuffer[yoff + ix] = c;
            idx += 1;
        }
    }

    esp_lcd_rgb_qemu_refresh(_panel);
    return;
}

void Panel_QemuRGB::writeImageARGB(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h, pixelcopy_t* param){
    ESP_LOGI("cglp", "- Panel_QemuRGB::writeImageARGB NOT SUPPORTED");
// not supported
}
void Panel_QemuRGB::copyRect(uint_fast16_t dst_x, uint_fast16_t dst_y, uint_fast16_t w, uint_fast16_t h, uint_fast16_t src_x, uint_fast16_t src_y){
    ESP_LOGI("cglp", "- Panel_QemuRGB::copyRect NOT SUPPORTED");
// not supported
}
uint_fast8_t Panel_QemuRGB::getTouchRaw(touch_point_t* tp, uint_fast8_t count){
// TODO: touch not supported?
}

