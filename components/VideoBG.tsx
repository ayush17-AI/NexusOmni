export default function VideoBG() {
    return (
        <div className="fixed top-0 left-0 w-screen h-screen -z-50 overflow-hidden">
            <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source src="/soft-space.mp4" type="video/mp4" />
            </video>
        </div>
    );
}
