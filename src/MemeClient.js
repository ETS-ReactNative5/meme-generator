var rp = require("request-promise");

export default class MemeClient {

    constructor() {
        this.endpoint = "http://central.thememebase.com:8080/";
        this.cache={};
    }

    async getTemplate() {
        return rp.get({uri: this.endpoint + "templates", json: true});
    }

    async generateMeme(templateName, textBlock) {

        let req = {
            memeTemplate: templateName,
            text: textBlock
        };
        let idx = JSON.stringify(req);
        let _this=this;
        if(this.cache[idx])
            return Promise.resolve(this.cache[idx]);
        return rp.post({
            url: this.endpoint + "memes",
            encoding: null, //NOTE - this is necessary to ensure that the image doesnt become corrupt in translation
            json: req
        }).then(val => {
            let ret = new Blob([val]);

            _this.cache[idx] = ret;

            return Promise.resolve(ret);
        });
    }
}

