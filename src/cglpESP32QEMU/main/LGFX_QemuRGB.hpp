#define LGFX_USE_V1

#include <LovyanGFX.hpp>

extern "C"
{
#include "cglp_duk.h"
#include "esp_lcd_panel_interface.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_qemu_rgb.h"
}

using namespace lgfx;

class Panel_QemuRGB : public lgfx::Panel_LCD
{
public:
    Panel_QemuRGB();

    void setDimensions(int width, int height);

    bool init(bool use_reset) override;
    void beginTransaction(void) override;
    void endTransaction(void) override;

    color_depth_t setColorDepth(color_depth_t depth);
    void setRotation(uint_fast8_t r) override;
    void setInvert(bool invert) override;
    void setSleep(bool flg) override;
    void setPowerSave(bool) override;

    void waitDisplay(void) override;
    bool displayBusy(void) override;

    void writePixels(pixelcopy_t* param, uint32_t len, bool use_dma) override;
    void writeBlock(uint32_t rawcolor, uint32_t length) override;
    void display(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h) override;
    void setWindow(uint_fast16_t xs, uint_fast16_t ys, uint_fast16_t xe, uint_fast16_t ye) override;
    void drawPixelPreclipped(uint_fast16_t x, uint_fast16_t y, uint32_t rawcolor) override;
    void writeFillRectPreclipped(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h, uint32_t rawcolor) override;
    void writeImage(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h, pixelcopy_t* param, bool use_dma) override;
    void writeImageARGB(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h, pixelcopy_t* param) override;

    uint32_t readCommand(uint_fast16_t cmd, uint_fast8_t index, uint_fast8_t len) override;
    uint32_t readData(uint_fast8_t index, uint_fast8_t len) override;
    void readRect(uint_fast16_t x, uint_fast16_t y, uint_fast16_t w, uint_fast16_t h, void* dst, pixelcopy_t* param) override;
    void copyRect(uint_fast16_t dst_x, uint_fast16_t dst_y, uint_fast16_t w, uint_fast16_t h, uint_fast16_t src_x, uint_fast16_t src_y) override;

    uint_fast8_t getTouchRaw(touch_point_t* tp, uint_fast8_t count) override;

public:
    esp_lcd_panel_handle_t _panel;
    int32_t _xs, _ys, _xe, _ye;
    int32_t _xpos = 0;
    int32_t _ypos = 0;
};

class LGFX_QemuRGB : public lgfx::LGFX_Device
{
    Panel_QemuRGB _panel_instance;

    bool init_impl(bool use_reset, bool use_clear)
    {
        return LGFX_Device::init_impl(false, use_clear);
    }

public:
    LGFX_QemuRGB(int width = 320, int height = 240, color_depth_t bpp = rgb565_2Byte)
    {
        auto cfg = _panel_instance.config();
        cfg.memory_width = width;
        cfg.panel_width = width;
        cfg.memory_height = height;
        cfg.panel_height = height;
        _panel_instance.config(cfg);
        _panel_instance.setColorDepth(bpp);
        _panel_instance.setRotation(0);
        setPanel(&_panel_instance);
        _board = lgfx::board_t::board_FrameBuffer;
    }

    void setDimensions(int width, int height) {
        _panel_instance.setDimensions(width, height);
    }
};
