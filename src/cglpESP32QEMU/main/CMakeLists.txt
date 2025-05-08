set(EXTERNAL_LIB_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../lib)

file(GLOB LIB_SOURCES ${EXTERNAL_LIB_DIR}/*.c)

idf_component_register(SRCS "cglpESP32QEMU.cpp" "LGFX_QemuRGB.cpp" ${LIB_SOURCES}
                       INCLUDE_DIRS "." ${EXTERNAL_LIB_DIR}
                       REQUIRES "LovyanGFX" "esp_lcd")

# Note: you must have a partition named the first argument (here it's "littlefs")
# in your partition table csv file.
littlefs_create_partition_image(games ../../../games FLASH_IN_PROJECT)