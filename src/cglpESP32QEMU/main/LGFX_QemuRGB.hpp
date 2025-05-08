#define LGFX_USE_V1


#include <LovyanGFX.hpp>

extern "C" {
    #include "cglp_duk.h"
    #include "esp_lcd_panel_interface.h"
    #include "esp_lcd_panel_ops.h"
    #include "esp_lcd_qemu_rgb.h"
    }

    class LGFX_QemuRGB : public lgfx::LGFX_Device {
        public:
          class Panel_QemuRGB : public lgfx::Panel_LCD {
          public:
            Panel_QemuRGB();
            void drawPixelPreclipped(uint_fast16_t x, uint_fast16_t y, uint32_t rawcolor) override;
            void setWindow(uint_fast16_t xs, uint_fast16_t ys, uint_fast16_t xe, uint_fast16_t ye) override;
            void writeBlock(uint32_t rawcolor, uint32_t length) override;

          public:
            esp_lcd_panel_handle_t _panel;
            int32_t _xs, _ys, _xe, _ye;
          };

          LGFX_QemuRGB();

        public:
          Panel_QemuRGB _panel_instance;
        };