import * as Dat from 'dat.gui';
import { Mapper } from "../math/Mapper";
import { EventHandler, EventTypes } from '../event/EventHandler';

const config = [
    {
        title: "Sync",
        open: true,
        subitems: [
            {
                key: "Wireframe",
                value: false,
                fn: (value) => EventHandler.throwEvent(EventTypes.Wireframe, value),
            },
            {
                key: "Outlines",
                value: true,
                fn: (value) => EventHandler.throwEvent(EventTypes.Outlines, value),
            },
            {
                key: "Cutter",
                value: true,
                fn: (value) => EventHandler.throwEvent(EventTypes.Cutter, value),
            }
        ]
    }
]

const controller = config
    .map((val) => val.subitems)
    .reduce((a, b) => a.concat(b))
    .map((val) => {
        let obj = {};
        obj[val.key] = val.value;
        return obj;
    })
    .reduce((a, b) => {
        return {...a, ...b}
    });

// create a gui element
let gui: Dat.GUI = new Dat.GUI();

config.map((value) => {
    const subfolder = gui.addFolder(value.title);
    if(value.open){
        subfolder.open();
    }

    value.subitems.map((subitem: any) => {
        subfolder.add(controller, subitem.key).onChange(subitem.fn);
    });
});
