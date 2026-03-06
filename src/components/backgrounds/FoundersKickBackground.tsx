import { Component as EtheralShadow } from "../ui/etheral-shadow";

export default function FoundersKickBackground() {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0
            }}
        >
            <EtheralShadow
                color="rgba(128, 128, 128, 1)"
                animation={{ scale: 80, speed: 70 }}
                noise={{ opacity: 0.35, scale: 1.2 }}
                sizing="fill"
            />
        </div>
    );
}