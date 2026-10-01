import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/life/index.md
var __pageData = JSON.parse("{\"title\":\"生活指南\",\"description\":\"生活指南 专题首页\",\"frontmatter\":{\"title\":\"生活指南\",\"description\":\"生活指南 专题首页\"},\"headers\":[],\"relativePath\":\"articles/life/index.md\",\"filePath\":\"articles/life/index.md\"}");
var _sfc_main = { name: "articles/life/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="生活指南" tabindex="-1">生活指南 <a class="header-anchor" href="#生活指南" aria-label="Permalink to “生活指南”">​</a></h1><p>欢迎来到「生活指南」专题。从这里进入各个栏目。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/life/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var life_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, life_default as default };
