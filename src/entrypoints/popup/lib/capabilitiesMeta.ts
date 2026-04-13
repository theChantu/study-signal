import {
    Camera,
    Download,
    Mic,
    Monitor,
    Pencil,
    Smartphone,
    Tablet,
    Volume2,
} from "@lucide/svelte";

export const DEVICE_META = {
    desktop: { label: "Desktop", icon: Monitor },
    tablet: { label: "Tablet", icon: Tablet },
    phone: { label: "Phone", icon: Smartphone },
} as const;

export const PERIPHERAL_META = {
    audio: { label: "Audio", icon: Volume2 },
    microphone: { label: "Microphone", icon: Mic },
    camera: { label: "Camera", icon: Camera },
    writing: { label: "Writing", icon: Pencil },
    download: { label: "Download", icon: Download },
} as const;
