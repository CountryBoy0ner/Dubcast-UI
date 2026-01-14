interface WindowWithGlobal { global?: unknown }
(window as WindowWithGlobal).global = window;
