import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/ai/index.md
var __pageData = JSON.parse("{\"title\":\"AI世界\",\"description\":\"AI世界 专题首页\",\"frontmatter\":{\"title\":\"AI世界\",\"description\":\"AI世界 专题首页\"},\"headers\":[],\"relativePath\":\"articles/ai/index.md\",\"filePath\":\"articles/ai/index.md\"}");
var _sfc_main = { name: "articles/ai/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="ai世界" tabindex="-1">AI世界 <a class="header-anchor" href="#ai世界" aria-label="Permalink to “AI世界”">​</a></h1><p>欢迎来到「AI世界」专题。从这里进入各个栏目。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/ai/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ai_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, ai_default as default };
