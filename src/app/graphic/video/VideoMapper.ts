import {DragHandler, DragHandlerTypes, IDragHandler} from "../../material/DragHandler";
import {IVideoMaterial, VideoMaterialBuilder, VideoType} from "../../material/VideoMaterialBuilder";
import {IDimension} from "../../math/DimensionTransformer";
import {EventHandler, EventTypes} from "../../event/EventHandler";

export class VideoMapper {


    public static init(videoSource: HTMLVideoElement, src: IVideoMaterial): IVideoMaterial {
        const videoMaterial: IVideoMaterial = VideoMaterialBuilder.init(videoSource, src);
        this.addDragHandles(videoMaterial);
        videoMaterial.type = VideoType.Mapper;

        return videoMaterial;
    }

    public static create(video: HTMLVideoElement, startPoint: IDimension): IVideoMaterial {
        const videoMaterial: IVideoMaterial = VideoMaterialBuilder.create(video, startPoint);
        this.addDragHandles(videoMaterial);

        videoMaterial.type = VideoType.Mapper;
        return videoMaterial;
    }

    private static addDragHandles(videoMaterial: IVideoMaterial): void {
        [
            DragHandler.create(videoMaterial.positions, DragHandlerTypes.Mapper, VideoMaterialBuilder.dragVideo(videoMaterial)),
            DragHandler.createMover(videoMaterial, VideoMaterialBuilder.moveVideo(videoMaterial, {x: 1, y: 1, z: 0})),
            DragHandler.createDelete(videoMaterial, () => EventHandler.throwEvent(EventTypes.RemoveQuad, videoMaterial)),
        ].forEach((dh: IDragHandler) => {
            videoMaterial.dragHandler.push(dh);
        });
    }

}
