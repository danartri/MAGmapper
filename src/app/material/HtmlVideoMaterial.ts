import {EventHandler, EventTypes} from "../event/EventHandler";

interface IAttribute {
    qualifiedName: string;
    value: string;
}

export class HtmlVideoMaterial {

    // set loop and autoplay, since sometimes it works, sometimes not
    private static attributes: IAttribute[] = [
        {qualifiedName: "autoplay", value: "autoplay"},
        {qualifiedName: "loop", value: "loop"},
        {qualifiedName: "codecs", value: "avc1.42E01E, mp4a.40.2"},
        {qualifiedName: "style", value: "display:none"},
    ];

    public static loadVideo(src: string): HTMLVideoElement {
        const video = this.init(src);

        document
            .getElementsByTagName("body")[0]
            .appendChild(video);
//das Teil macht play oder pause
        EventHandler.addEventListener(EventTypes.PlayVideo, (value) => {
            if (value.detail.value) {
                video.play(); // wenn value.details
            } else {
                video.pause();
            }
        });
        return video;
    }
    and

//das Teil macht Geschwindigkeit
        /*EventHandler.addEventListener(EventTypes.VideoSpeed, (value) => {
            if (value) == 1{
                video.playbackRate(1); 
            } 
            if (value) == 0.5 {
                video.playbackRate(0.5);
            }
        });
        
        return video;
}
*/

    private static init(src: string): HTMLVideoElement {
        const video: HTMLVideoElement = document.createElement("video");

        this.attributes.map((attr: IAttribute) => {
            video.setAttribute(attr.qualifiedName, attr.value);
        });

        video.setAttribute("src", src);

        return video;
    }
}