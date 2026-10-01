import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
//#region pages/posts.md
var __pageData = JSON.parse("{\"title\":\"全部文章\",\"description\":\"\",\"frontmatter\":{\"title\":\"全部文章\",\"layout\":\"page\"},\"headers\":[],\"relativePath\":\"pages/posts.md\",\"filePath\":\"pages/posts.md\"}");
var _sfc_main = { name: "pages/posts.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_PostsList = resolveComponent("PostsList");
	_push(`<div${ssrRenderAttrs(_attrs)}>`);
	_push(ssrRenderComponent(_component_PostsList, null, null, _parent));
	_push(`</div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/posts.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var posts_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, posts_default as default };
