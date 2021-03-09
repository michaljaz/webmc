import { encode, decode, decodeAsync } from "@msgpack/msgpack";
import swal from "sweetalert";

class Socket {
    constructor(game, url) {
        this.game = game;
        this.ws = new WebSocket(url);
        this.handlers = new Map();
        this.ws.onmessage = async (message) => {
            try {
                const [type, ...data] = await this.decodeFromBlob(message.data);
                const handler = this.handlers.get(type);

                handler && handler(...data);
            } catch (err) {
                console.log(err);
            }
        };
        this.ws.onclose = () => {
            console.log("Lost connection!");
            swal({
                title: "You have lost connection!",
                text: "Websocket connection have been closed!",
                icon: "error",
                button: "Rejoin",
            }).then(function () {
                document.location.reload();
            });
        };
        this.ws.onerror = (err) => {
            console.log(err);
        };
    }
    emit(type, ...data) {
        this.ws.send(
            encode([
                type,
                ...data.filter((d) => typeof d !== "function"), // Temp solution
            ])
        );
    }
    on(type, handler) {
        this.handlers.set(type, handler);
    }
    async decodeFromBlob(blob) {
        if (blob.stream) {
            return await decodeAsync(blob.stream());
        }

        return decode(await blob.arrayBuffer());
    }
}
export { Socket };
