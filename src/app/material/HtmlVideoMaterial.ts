interface IAttribute {
    qualifiedName: string;
    value: string;
}

export class HtmlVideoMaterial {

    public static loadVideo(): HTMLVideoElement {
        const video = this.init();
        document
            .getElementsByTagName("body")[0]
            .appendChild(video);

        video.play();
        return video;
    }

    // todo set loop
    private static attributes: IAttribute[] = [
        {qualifiedName: "id", value: "video"},
        {qualifiedName: "controls", value: "true"},
        {qualifiedName: "src", value: "assets/testvideo.mp4"},
        {qualifiedName: "codecs", value: "avc1.42E01E, mp4a.40.2"},
        {qualifiedName: "style", value: "display:none"}
    ];

    private static init(): HTMLVideoElement {
        const video: HTMLVideoElement = document.createElement("video");
        this.attributes.map((attr: IAttribute) => video.setAttribute(attr.qualifiedName, attr.value));
        return video;
    }
}