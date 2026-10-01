import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/notes/index.md
var __pageData = JSON.parse("{\"title\":\"随笔\",\"description\":\"随笔 专题首页\",\"frontmatter\":{\"title\":\"随笔\",\"description\":\"随笔 专题首页\"},\"headers\":[],\"relativePath\":\"articles/notes/index.md\",\"filePath\":\"articles/notes/index.md\"}");
var _sfc_main = { name: "articles/notes/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="随笔" tabindex="-1">随笔 <a class="header-anchor" href="#随笔" aria-label="Permalink to “随笔”">​</a></h1><p>欢迎来到「随笔」专题。从这里进入各个栏目。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/notes/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var notes_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, notes_default as default };
