#include "nvs_flash.h"
#include "nvs.h"
#include "esp_log.h"



int md_hiScoreInit() {
    // TODO: switch to dedicated partition instead of sharing with wifi data
    esp_err_t err = nvs_flash_init_partition("hiscore");
    // if (err == ESP_ERR_NVS_NO_FREE_PAGES) {
    //     ESP_ERROR_CHECK(nvs_flash_erase());
    //     err = nvs_flash_init();
    // }
    ESP_ERROR_CHECK(err);
}


int md_hiScoreLoad(char* name) {
    nvs_handle_t handle;
    esp_err_t err = nvs_open("hiscore", NVS_READONLY, &handle);
    if (err != ESP_OK) {
        return -1;
    }

    int32_t value = 0;
    err = nvs_get_i32(handle, name, &value);
    nvs_close(handle);

    switch (err) {
        case ESP_OK:
            return value;
        case ESP_ERR_NVS_NOT_FOUND:
            return 0;
        default:
            // printf("Error (%s) reading!\n", esp_err_to_name(err));
            return -1;
    }
}

int md_hiScoreSave(char* name, int score) {
    nvs_handle_t handle;
    esp_err_t err = nvs_open("hiscore", NVS_READWRITE, &handle);
    if (err != ESP_OK) {
        return -1;
    }
    int32_t value = 0;
    err = nvs_get_i32(handle, name, &value);
    if ((err == ESP_OK && value < score) || err == ESP_ERR_NVS_NOT_FOUND) {
        err = nvs_set_i32(handle, name, score);
        ESP_ERROR_CHECK(err);
        err = nvs_commit(handle);
        ESP_ERROR_CHECK(err);
    } else {
        // printf("Error (%s) reading!\n", esp_err_to_name(err));
    }
    nvs_close(handle);
}




