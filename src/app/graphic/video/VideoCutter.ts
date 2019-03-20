import {LineBuilder} from "../../material/LineBuilder";
import {SpriteBuilder} from "../../material/SpriteBuilder";
import {IVideoMaterial, VideoMaterialBuilder, VideoType} from "../../material/VideoMaterialBuilder";
import {VideoSceneHelper} from "../../material/VideoSceneHelper";
import {IDimension} from "../../math/DimensionTransformer";
import {UvMapper} from "../../math/UvMapper";
import {DragHandler, DragHandlerTypes, IDragHandler} from "../../dragger/DragHandler";
import {Scene, Sprite} from "three";

export class VideoCutter {

    public static create(targets: IVideoMaterial[], video: HTMLVideoElement, startPoint: IDimension): IVideoMaterial {

        const videoMaterial: IVideoMaterial = VideoMaterialBuilder.create(video, startPoint);
        videoMaterial.type = VideoType.Cutter;
        targets.forEach((target) => {
            videoMaterial.dragHandler.push(this.createCutterDragHandle(videoMaterial, target));
        });

        return videoMaterial;
    }


    public static addVideoCutterOutlines(videoMaterial: IVideoMaterial, target: IVideoMaterial): IVideoMaterial {
        videoMaterial.dragHandler.push(this.createCutterDragHandle(videoMaterial, target));
        return videoMaterial;
    }


    private static createCutterDragHandle(videoMaterial: IVideoMaterial, target: IVideoMaterial): IDragHandler {
        const cutter = DragHandler.create(videoMaterial.positions, DragHandlerTypes.Cutter, (event) => {
            const activeDragHandler = videoMaterial.dragHandler.filter((dh: IDragHandler) => dh.id === event.object.name)[0];
            const spriteEdges: IDimension[] = SpriteBuilder.loadSpriteEdges(activeDragHandler.sprites);
            LineBuilder.reorderLines(activeDragHandler.line, spriteEdges);

            const uv: IDimension[] = UvMapper.reorderUvMapping(spriteEdges, activeDragHandler.edges);
            VideoSceneHelper.changeUv(uv, target.mesh);
        });

        cutter.targetId = target.id;
        return cutter;
    }

    public static removeCutterItem(videoMaterial: IVideoMaterial[], target: IVideoMaterial, scene: Scene) {
        videoMaterial
            .filter((video: IVideoMaterial) => video.type === VideoType.Cutter)
            .map((video: IVideoMaterial) => {

                video.dragHandler
                    .filter((dh: IDragHandler) => target.id === dh.targetId)
                    .map((dh: IDragHandler) => {

                        scene.remove(dh.line);
                        dh.sprites.forEach((sprite: Sprite) => {
                            scene.remove(sprite);
                        });
                        // removes draghandler from list
                        video.dragHandler.splice( video.dragHandler.indexOf(dh), 1 );
                    });
            });

    }
}