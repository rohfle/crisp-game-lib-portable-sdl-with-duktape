# COMMANDS TO RUN
```
diff --git a/tools/idf_py_actions/qemu_ext.py b/tools/idf_py_actions/qemu_ext.py
index 716af4ad95..a354592af3 100644
--- a/tools/idf_py_actions/qemu_ext.py
+++ b/tools/idf_py_actions/qemu_ext.py
@@ -279,9 +279,6 @@ def action_extensions(base_actions: Dict, project_path: str) -> Dict:
         if options.wait_for_gdb or gdb:
             qemu_args += ['-gdb', f'tcp::{QEMU_PORT_GDB}', '-S']

-        if qemu_extra_args:
-            qemu_args += qemu_extra_args.split(' ')
-
         if graphics:
             qemu_args += ['-display', 'sdl']
         else:
@@ -293,6 +290,8 @@ def action_extensions(base_actions: Dict, project_path: str) -> Dict:
         # Launch QEMU!
         if not options.bg_mode:
             qemu_args += ['-serial', 'mon:stdio']
+            if qemu_extra_args:
+                qemu_args += qemu_extra_args.split(' ')
             yellow_print('Running qemu (fg): ' + ' '.join(qemu_args))
             subprocess.run(qemu_args)
         else:
@@ -301,6 +300,9 @@ def action_extensions(base_actions: Dict, project_path: str) -> Dict:
             else:
                 qemu_args += ['-serial', f'tcp::{QEMU_PORT_SERIAL},server,nowait']

+            if qemu_extra_args:
+                qemu_args += qemu_extra_args.split(' ')
+
             yellow_print('Running qemu (bg): ' + ' '.join(qemu_args))
             qemu_proc = subprocess.Popen(qemu_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
             wait_for_socket(QEMU_PORT_SERIAL)
```


```
idf.py qemu --graphics --qemu-extra-args "-serial telnet:localhost:4444,server,nowait" monitor
```

```
python3 key_client.py
```


# QEMU RGB Panel

This example demonstrates how to use the virtual QEMU RGB panel. In this case, LVGL uses the virtual panel to render its graphical user interface.

The frame buffer can be chosen between internal RAM or dedicated frame buffer.

## How to Use Example

### Hardware Required

* No hardware target is required to run this example

### Configure the Example

By default, the example will use the target internal RAM as the frame buffer. To utilize the QEMU dedicated frame buffer, enable the option `Use QEMU RGB panel dedicated framebuffer` within the `menuconfig`.

### Build and run

To build the example, run `idf.py build` command.

Please refer to the [QEMU Guide](https://github.com/espressif/esp-toolchain-docs/blob/main/qemu/README.md) for the detailed steps to setup and run the image.

## Example Output

```text
I (55) example: Install RGB LCD panel driver
I (55) example: Initialize RGB LCD panel
I (55) example: Initialize LVGL library
I (55) example: Allocate separate LVGL draw buffer
I (55) example: Register display driver to LVGL
I (55) example: Install LVGL tick timer
I (55) example: Create LVGL task
I (55) example: Starting LVGL task
I (65) example: Display LVGL Scatter Chart
I (75) main_task: Returned from app_main()
```
