const frisby = require("frisby");


describe("Request", function() {
    it("should be ", async function() {
        await frisby.get("http://httpbin.org/status/418")
            .expect("status", 418);
    });
});