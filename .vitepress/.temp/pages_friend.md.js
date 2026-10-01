import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
//#region pages/friend.md
var __pageData = JSON.parse("{\"title\":\"链接\",\"description\":\"\",\"frontmatter\":{\"title\":\"链接\",\"layout\":\"page\",\"friendPage\":{\"desc\":\"欢迎交换友链：只收录稳定更新、内容原创、无恶意广告的站点。联系我admin@wyclab.com\",\"defaultAvatar\":\"https://wyclab.com/favicon/android-chrome-512x512.png\"},\"friendTemplate\":{\"name\":\"wyclab\",\"description\":\"无用处实验室\",\"url\":\"https://wyclab.com\",\"friendLink\":\"https://wyclab.com/pages/friend\",\"avatar\":\"https://wyclab.com/favicon/android-chrome-512x512.png\",\"logo\":\"https://wyclab.com/favicon/android-chrome-512x512.png\",\"email\":\"admin@wyclab.com\"},\"friendFormat\":[{\"label\":\"站点名称\",\"value\":\"wyclab\"},{\"label\":\"站点地址\",\"value\":\"https://wyclab.com\"},{\"label\":\"站点描述\",\"value\":\"前端开发工程师 | 技术博主\"},{\"label\":\"头像地址\",\"value\":\"https://github.com/wyclab.png\"}],\"friends\":[{\"name\":\"VitePress\",\"url\":\"https://vitepress.dev/zh/\",\"desc\":\"VitePress 官方文档\",\"avatar\":\"https://vitepress.dev/vitepress-logo-mini.svg\",\"tags\":[\"文档\",\"静态站点\"]},{\"name\":\"个站商店\",\"url\":\"https://storeweb.cn/\",\"desc\":\"一个精致的，带社交元素的个人网站发布平台，博客收录网站\",\"avatar\":\"https://upload.storeweb.cn/image/logo.png\",\"tags\":[\"聚合站\"]},{\"name\":\"博友圈\",\"url\":\"https://www.boyouquan.com/home/\",\"desc\":\"让我们跨越山海彼此相连，一起用文字打败时间！\",\"avatar\":\"https://www.boyouquan.com/assets/images/sites/logo/logo-small.svg\",\"tags\":[\"聚合站\"]},{\"name\":\"BlogsClub\",\"url\":\"https://www.blogsclub.org/\",\"desc\":\"让博主们能够在这里共同分享彼此的经验和知识，共同进步。\",\"avatar\":\"https://www.blogsclub.org/usr/themes/default/favicon.png\",\"tags\":[\"聚合站\"]}]},\"headers\":[],\"relativePath\":\"pages/friend.md\",\"filePath\":\"pages/friend.md\"}");
var _sfc_main = { name: "pages/friend.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_FriendPage = resolveComponent("FriendPage");
	_push(`<div${ssrRenderAttrs(_attrs)}>`);
	_push(ssrRenderComponent(_component_FriendPage, null, null, _parent));
	_push(`</div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/friend.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var friend_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, friend_default as default };
