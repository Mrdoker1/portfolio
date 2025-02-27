import PageBuilder from "./src/script/script.js";

try {
    window.pageBuilder = new PageBuilder();
} catch (e) {
    console.log(JSON.stringify(e.type, e.message));
}