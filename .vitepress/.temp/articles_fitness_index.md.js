import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/fitness/index.md
var __pageData = JSON.parse("{\"title\":\"健康健身\",\"description\":\"健康健身 专题首页\",\"frontmatter\":{\"title\":\"健康健身\",\"description\":\"健康健身 专题首页\"},\"headers\":[],\"relativePath\":\"articles/fitness/index.md\",\"filePath\":\"articles/fitness/index.md\"}");
var _sfc_main = { name: "articles/fitness/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="健康健身" tabindex="-1">健康健身 <a class="header-anchor" href="#健康健身" aria-label="Permalink to “健康健身”">​</a></h1><p>欢迎来到「健康健身」专题。从这里进入各个栏目。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/fitness/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var fitness_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, fitness_default as default };
