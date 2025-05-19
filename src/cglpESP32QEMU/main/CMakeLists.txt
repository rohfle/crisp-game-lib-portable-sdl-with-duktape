set(PROJECT_BASE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../..")
set(EXTERNAL_LIB_DIR "${PROJECT_BASE_DIR}/src/lib")
set(PACKED_DIR "${PROJECT_BASE_DIR}/games")
set(PACKED_BIN "${CMAKE_CURRENT_BINARY_DIR}/games.bin")
file(GLOB PACKED_FILES "${PACKED_DIR}/*.es5.js")

file(GLOB LIB_SOURCES ${EXTERNAL_LIB_DIR}/*.c ${EXTERNAL_LIB_DIR}/loaders/games_packed.c ${EXTERNAL_LIB_DIR}/loaders/hiscores_esp32_nvs.c)

idf_component_register(SRCS "cglpESP32QEMU.cpp" "LGFX_QemuRGB.cpp" ${LIB_SOURCES}
                       INCLUDE_DIRS "." ${EXTERNAL_LIB_DIR}
                       REQUIRES "LovyanGFX" "esp_lcd"
                       EMBED_FILES ${PACKED_BIN})

# https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/build-system.html#cmake-embed-data
add_custom_command(
    OUTPUT ${PACKED_BIN}
    COMMAND python3 ${PROJECT_BASE_DIR}/packJSGames.py ${PACKED_DIR} ${PACKED_BIN}
    DEPENDS ${PACKED_FILES} ${PROJECT_BASE_DIR}/packJSGames.py
    COMMENT "Packing files into binary blob"
    VERBATIM
)

