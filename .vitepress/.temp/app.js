import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { Fragment, Transition, computed, createBlock, createCommentVNode, createSSRApp, createTextVNode, createVNode, defineAsyncComponent, defineComponent, h, inject, markRaw, mergeProps, nextTick, onBeforeUnmount, onMounted, onScopeDispose, onUnmounted, onUpdated, openBlock, provide, reactive, readonly, ref, renderList, renderSlot, resolveComponent, resolveDynamicComponent, shallowReadonly, shallowRef, toDisplayString, toValue, unref, useId, useSSRContext, useSlots, useTemplateRef, watch, watchEffect, watchPostEffect, withCtx, withModifiers } from "vue";
import { onKeyStroke, tryOnUnmounted, useDark, useEventListener, useMediaQuery, useNavigatorLanguage, usePreferredDark, useWindowScroll, whenever } from "@vueuse/core";
import { renderToString, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderStyle, ssrRenderVNode } from "vue/server-renderer";
//#region node_modules/vitepress/dist/client/app/components/ClientOnly.js
var ClientOnly = defineComponent({ setup(_, { slots }) {
	const show = ref(false);
	onMounted(() => {
		show.value = true;
	});
	return () => show.value && slots.default ? slots.default() : null;
} });
//#endregion
//#region node_modules/vitepress/dist/client/shared.js
var EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;
var APPEARANCE_KEY = "vitepress-theme-appearance";
var iconNameRE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/**
* Parses a fully qualified `collection:name` icon name, corresponding to
* the `vpi-<collection>-<name>` class. Returns null for anything else,
* keeping malformed input out of generated selectors and class attributes.
*/
function parseIconName(name) {
	const colon = name.indexOf(":");
	if (colon === -1) return null;
	const collection = name.slice(0, colon);
	const icon = name.slice(colon + 1);
	if (!iconNameRE.test(collection) || !iconNameRE.test(icon)) return null;
	return {
		collection,
		icon
	};
}
/**
* Placeholder prepended to SSR-emitted URLs when base is relative, later
* replaced with each page's `../` prefix back to the site root.
*/
var RELATIVE_BASE_SENTINEL = "/__VP_BASE__/";
function isRelativeBase(base) {
	return base === "./";
}
/**
* Join two paths, collapsing slash collisions but keeping the `//` that
* follows a protocol.
*/
function joinPath(base, path) {
	const protocol = /^(?:[a-z]+:)?\/\//i.exec(base)?.[0] ?? "";
	return protocol + `${base.slice(protocol.length)}${path}`.replace(/\/+/g, "/");
}
var UnpackStackView = Symbol("stack-view:unpack");
var HASH_WITHOUT_FRAGMENT_RE = /#.*?(?=:~:|$)/;
var HASH_OR_QUERY_RE = /[?#].*$/;
var INDEX_OR_EXT_RE = /(?:(^|\/)index)?(?:\.(?:md|html))?$/;
var INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
var DRIVE_LETTER_REGEX = /^[a-z]:/i;
var KNOWN_EXTENSIONS = /* @__PURE__ */ new Set();
var shellLangs = [
	"shellscript",
	"shell",
	"bash",
	"sh",
	"zsh"
];
var inBrowser = typeof document !== "undefined";
var notFoundPageData = {
	relativePath: "404.md",
	filePath: "",
	title: "404",
	description: "Not Found",
	headers: [],
	frontmatter: {
		sidebar: false,
		layout: "page"
	},
	lastUpdated: 0,
	isNotFound: true
};
function isActive(currentPath, currentHash, matchPath, asRegex = false, skipHashCheck = false) {
	currentPath = normalize(`/${currentPath}`);
	if (asRegex) return new RegExp(matchPath).test(currentPath);
	if (normalize(matchPath) !== currentPath) return false;
	if (skipHashCheck) return true;
	const hashMatch = matchPath.match(HASH_WITHOUT_FRAGMENT_RE);
	if (hashMatch) return currentHash === hashMatch[0];
	return true;
}
function normalize(path) {
	return decodeURI(path).replace(HASH_OR_QUERY_RE, "").replace(INDEX_OR_EXT_RE, "$1");
}
function isExternal(path) {
	return EXTERNAL_URL_RE.test(path);
}
function getLocaleForPath(siteData, relativePath) {
	return Object.keys(siteData?.locales || {}).find((key) => key !== "root" && !isExternal(key) && isActive(relativePath, "", `^/${key}/`, true)) || "root";
}
/**
* Resolves the site data for a route, layering the matched locale and
* additional configs over the root config.
*/
function resolveSiteDataByRoute(siteData, relativePath, filePath) {
	const localeIndex = getLocaleForPath(siteData, relativePath);
	const { label, link, markdown, ...localeConfig } = siteData.locales[localeIndex] ?? {};
	Object.assign(localeConfig, { localeIndex });
	const additionalConfigs = resolveAdditionalConfig(siteData, filePath || relativePath);
	return stackView({ head: mergeHead(siteData.head ?? [], localeConfig.head ?? [], ...additionalConfigs.map((data) => data.head ?? []).reverse()) }, ...additionalConfigs, localeConfig, siteData);
}
/**
* Create the page title string based on config.
*/
function createTitle(siteData, pageData) {
	const title = pageData.title || siteData.title;
	const template = pageData.titleTemplate ?? siteData.titleTemplate;
	if (typeof template === "string" && template.includes(":title")) return template.replace(/:title/g, title);
	const templateString = createTitleTemplate(siteData.title, template);
	if (title === templateString.slice(3)) return title;
	return `${title}${templateString}`;
}
function createTitleTemplate(siteTitle, template) {
	if (template === false) return "";
	if (template === true || template === void 0) return ` | ${siteTitle}`;
	if (siteTitle === template) return "";
	return ` | ${template}`;
}
function mergeHead(...headArrays) {
	const merged = [];
	const keyMap = /* @__PURE__ */ new Map();
	for (const current of headArrays) for (const tag of current) {
		const key = getHeadKey(tag);
		if (key == null) {
			merged.push(tag);
			continue;
		}
		const existingIndex = keyMap.get(key);
		if (existingIndex != null) merged[existingIndex] = tag;
		else {
			keyMap.set(key, merged.length);
			merged.push(tag);
		}
	}
	return merged;
}
function getHeadKey([type, attrs]) {
	if (attrs.id) return `id=${attrs.id}`;
	if (type !== "meta") return;
	for (const name in attrs) if (name !== "content") return `${name}=${attrs[name]}`;
}
function sanitizeFileName(name) {
	const match = DRIVE_LETTER_REGEX.exec(name);
	const driveLetter = match ? match[0] : "";
	return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, "_").replace(/(^|\/)_+(?=[^/]*$)/, "$1");
}
function treatAsHtml(filename) {
	if (KNOWN_EXTENSIONS.size === 0) {
		const extraExts = globalThis.process?.env?.VITE_EXTRA_EXTENSIONS || "";
		("3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a,man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,opus,otf,p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml,yaml,yml,zip" + (extraExts && typeof extraExts === "string" ? "," + extraExts : "")).split(",").forEach((ext) => KNOWN_EXTENSIONS.add(ext));
	}
	const ext = filename.split(".").pop();
	return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase());
}
function escapeRegExp(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function resolveAdditionalConfig({ additionalConfig }, path) {
	if (additionalConfig === void 0) return [];
	if (typeof additionalConfig === "function") return additionalConfig(path) ?? [];
	const configs = [];
	const segments = path.split("/").slice(0, -1);
	while (segments.length) {
		const key = `/${segments.join("/")}/`;
		configs.push(additionalConfig[key]);
		segments.pop();
	}
	configs.push(additionalConfig["/"]);
	return configs.filter((config) => config !== void 0);
}
/**
* Creates a readonly proxy behaving like a deep merge of the given layers,
* without mutating them. Earlier layers take precedence.
*/
function stackView(..._layers) {
	const layers = _layers.filter((layer) => isObject(layer));
	if (layers.length <= 1) return _layers[0];
	const allKeys = new Set(layers.flatMap((layer) => Reflect.ownKeys(layer)));
	const allKeysArray = [...allKeys];
	return new Proxy({}, {
		get(_, prop) {
			if (prop === UnpackStackView) return layers;
			return stackView(...layers.map((layer) => layer[prop]).filter((v) => v !== void 0));
		},
		set() {
			throw new Error("StackView is read-only and cannot be mutated.");
		},
		has(_, prop) {
			return allKeys.has(prop);
		},
		ownKeys() {
			return allKeysArray;
		},
		getOwnPropertyDescriptor(_, prop) {
			for (const layer of layers) {
				const descriptor = Object.getOwnPropertyDescriptor(layer, prop);
				if (descriptor) return descriptor;
			}
		}
	});
}
stackView.unpack = function(obj) {
	return obj?.[UnpackStackView];
};
function isObject(value) {
	return Object.prototype.toString.call(value) === "[object Object]";
}
function isShell(lang) {
	return shellLangs.includes(lang);
}
//#endregion
//#region ../../../../../@siteData
function deserializeFunctions(r, e) {
	return Array.isArray(r) ? r.map((t) => deserializeFunctions(t, e)) : typeof r == "object" && r !== null ? Object.keys(r).reduce((t, n) => (t[n] = deserializeFunctions(r[n], e), t), {}) : typeof r == "string" && r.startsWith("_vp-fn_") ? e[+r.slice(7)] ?? r : r;
}
var _siteData_default = deserializeFunctions(JSON.parse("{\"lang\":\"zh-CN\",\"dir\":\"ltr\",\"title\":\"无用处\",\"description\":\"无用处实验室，看似无用，实则真的无用。\",\"base\":\"/\",\"head\":[],\"router\":{\"prefetchLinks\":true},\"appearance\":true,\"themeConfig\":{\"siteStats\":{\"totalWords\":178004},\"nav\":[{\"text\":\"首页\",\"link\":\"/\"},{\"text\":\"文章\",\"link\":\"/pages/posts\"},{\"text\":\"专题\",\"items\":[{\"text\":\"置身事内\",\"link\":\"/articles/zstn/\"},{\"text\":\"生活指南\",\"link\":\"/articles/life/\"},{\"text\":\"健康健身\",\"link\":\"/articles/fitness/\"},{\"text\":\"AI世界\",\"link\":\"/articles/ai/\"},{\"text\":\"投资笔记\",\"link\":\"/articles/invest/\"},{\"text\":\"随笔\",\"link\":\"/articles/notes/\"}]},{\"text\":\"标签\",\"link\":\"/pages/tags\"},{\"text\":\"友链\",\"link\":\"/pages/friend\"},{\"text\":\"关于\",\"link\":\"/pages/about\"}],\"sidebar\":{\"/articles/zstn/\":[{\"text\":\"宏观观察\",\"link\":\"/articles/zstn/macro/\",\"collapsed\":false,\"items\":[{\"text\":\"房地产\",\"link\":\"/articles/zstn/macro/real-estate\"},{\"text\":\"周期\",\"link\":\"/articles/zstn/macro/economic-cycle\"},{\"text\":\"全球化\",\"link\":\"/articles/zstn/macro/global-economics\"},{\"text\":\"美国房地产\",\"link\":\"/articles/zstn/macro/us-real-estate\"},{\"text\":\"通胀与通缩\",\"link\":\"/articles/zstn/macro/2025\"},{\"text\":\"刺激消费的韩国样本\",\"link\":\"/articles/zstn/macro/cijixiaofei\"}]},{\"text\":\"政府观察\",\"link\":\"/articles/zstn/gov/\",\"collapsed\":false,\"items\":[{\"text\":\"隐债\",\"link\":\"/articles/zstn/gov/yinzai\"},{\"text\":\"政府投资\",\"link\":\"/articles/zstn/gov/gov_invest\"},{\"text\":\"2025年限薪！\",\"link\":\"/articles/zstn/gov/2025xianxin\"},{\"text\":\"反诈与社会成本\",\"link\":\"/articles/zstn/gov/96110\"}]},{\"text\":\"企业观察\",\"link\":\"/articles/zstn/firm/\",\"collapsed\":false,\"items\":[{\"text\":\"百度\",\"link\":\"/articles/zstn/firm/Baidu\"},{\"text\":\"APPLE\",\"link\":\"/articles/zstn/firm/Apple\"},{\"text\":\"英伟达\",\"link\":\"/articles/zstn/firm/nvidia\"},{\"text\":\"SpaceX\",\"link\":\"/articles/zstn/firm/spacex\"},{\"text\":\"摩尔线程IPO\",\"link\":\"/articles/zstn/firm/moerxiancheng\"},{\"text\":\"马斯克第一性原理\",\"link\":\"/articles/zstn/firm/masikehuojian\"},{\"text\":\"加班银行与共同富裕\",\"link\":\"/articles/zstn/firm/zhaohang\"},{\"text\":\"中美火箭回收有何异同\",\"link\":\"/articles/zstn/firm/huojianhuishou\"}]},{\"text\":\"法治观察\",\"link\":\"/articles/zstn/law/\",\"collapsed\":false,\"items\":[{\"text\":\"合法羁押三百天\",\"link\":\"/articles/zstn/law/jiya\"}]}],\"/articles/life/\":[{\"text\":\"人生主线\",\"link\":\"/articles/life/life-plan/\",\"collapsed\":false,\"items\":[{\"text\":\"人生目标\",\"link\":\"/articles/life/life-plan/keypoint\"},{\"text\":\"管理艺术\",\"link\":\"/articles/life/life-plan/management\"}]},{\"text\":\"北京通\",\"link\":\"/articles/life/beijing/\",\"collapsed\":false,\"items\":[{\"text\":\"北京医保\",\"link\":\"/articles/life/beijing/BJyibao\"},{\"text\":\"北京产科\",\"link\":\"/articles/life/beijing/fuchan\"},{\"text\":\"北京小客车\",\"link\":\"/articles/life/beijing/car\"}]},{\"text\":\"养娃记录\",\"link\":\"/articles/life/parenting/\",\"collapsed\":false,\"items\":[{\"text\":\"怀孕记录\",\"link\":\"/articles/life/parenting/pregnant\"},{\"text\":\"家庭用药\",\"link\":\"/articles/life/parenting/child_medic\"}]},{\"text\":\"智能生活\",\"link\":\"/articles/life/smart-life/\",\"collapsed\":false,\"items\":[{\"text\":\"家庭网络\",\"link\":\"/articles/life/smart-life/network\"},{\"text\":\"家庭净水\",\"link\":\"/articles/life/smart-life/water\"},{\"text\":\"家用椭圆仪\",\"link\":\"/articles/life/smart-life/tuoyuanyi\"},{\"text\":\"数字人生计划\",\"link\":\"/articles/life/smart-life/shuzirensheng\"}]},{\"text\":\"生产力\",\"link\":\"/articles/life/productivity/\",\"collapsed\":false,\"items\":[{\"text\":\"必备软件\",\"link\":\"/articles/life/productivity/windows_software\"}]}],\"/articles/fitness/\":[{\"text\":\"基础知识\",\"link\":\"/articles/fitness/basics/\",\"collapsed\":false,\"items\":[{\"text\":\"器官健康\",\"link\":\"/articles/fitness/basics/organ\"},{\"text\":\"GI与GL\",\"link\":\"/articles/fitness/basics/GI\"},{\"text\":\"睡眠\",\"link\":\"/articles/fitness/basics/sleep\"},{\"text\":\"内分泌必读基础\",\"link\":\"/articles/fitness/basics/hormone\"},{\"text\":\"补剂\",\"link\":\"/articles/fitness/basics/supplement\"},{\"text\":\"健康指标\",\"link\":\"/articles/fitness/basics/health-indicators\"}]},{\"text\":\"日常体态\",\"link\":\"/articles/fitness/posture/\",\"collapsed\":false,\"items\":[{\"text\":\"体态\",\"link\":\"/articles/fitness/posture/posture\"}]},{\"text\":\"功能训练\",\"link\":\"/articles/fitness/functional/\",\"collapsed\":false,\"items\":[{\"text\":\"椭圆仪（有氧）\",\"link\":\"/articles/fitness/functional/tuoyuanyi\"},{\"text\":\"筋膜\",\"link\":\"/articles/fitness/functional/Fascia\"}]},{\"text\":\"力量训练\",\"link\":\"/articles/fitness/strength/\",\"collapsed\":false,\"items\":[{\"text\":\"动作指引\",\"link\":\"/articles/fitness/strength/start\"},{\"text\":\"RM选择\",\"link\":\"/articles/fitness/strength/RM\"},{\"text\":\"肌群概览\",\"link\":\"/articles/fitness/strength/overview\"}]}],\"/articles/ai/\":[{\"text\":\"AI投资\",\"link\":\"/articles/ai/ai-invest/\",\"collapsed\":false,\"items\":[]},{\"text\":\"AI技术\",\"link\":\"/articles/ai/ai-tech/\",\"collapsed\":false,\"items\":[{\"text\":\"AI时代的废人\",\"link\":\"/articles/ai/ai-tech/aifeiren\"},{\"text\":\"AI与经济危机\",\"link\":\"/articles/ai/ai-tech/aijingjiweiji\"},{\"text\":\"DeepSeek V4 开源\",\"link\":\"/articles/ai/ai-tech/deepseekV4\"},{\"text\":\"Gemma4-12B本地部署\",\"link\":\"/articles/ai/ai-tech/gemma4-12b\"}]},{\"text\":\"提示词\",\"link\":\"/articles/ai/prompts/\",\"collapsed\":false,\"items\":[]}],\"/articles/invest/\":[{\"text\":\"基础知识\",\"link\":\"/articles/invest/basics/\",\"collapsed\":false,\"items\":[{\"text\":\"原油宝\",\"link\":\"/articles/invest/basics/yuanyoubao\"},{\"text\":\"美股\",\"link\":\"/articles/invest/basics/meigu\"}]},{\"text\":\"实战记录\",\"link\":\"/articles/invest/practice/\",\"collapsed\":false,\"items\":[]}],\"/articles/notes/\":[{\"text\":\"日记\",\"link\":\"/articles/notes/diary/\",\"collapsed\":false,\"items\":[{\"text\":\"2026年\",\"collapsed\":true,\"items\":[{\"text\":\"熟客理发师搞消费套路\",\"link\":\"/articles/notes/diary/lifataolu\"},{\"text\":\"二叉树与复利\",\"link\":\"/articles/notes/diary/shijiuchennianhua\"},{\"text\":\"清明与乡土\",\"link\":\"/articles/notes/diary/qingming2026\"},{\"text\":\"心头的第一座坟\",\"link\":\"/articles/notes/diary/diyizuofen\"}]},{\"text\":\"2025年及以前\",\"collapsed\":true,\"items\":[{\"text\":\"我也要提前还贷了\",\"link\":\"/articles/notes/diary/tiqianhuandai\"},{\"text\":\"被偷走的五年\",\"link\":\"/articles/notes/diary/biye5nian\"},{\"text\":\"一个人开长途真累\",\"link\":\"/articles/notes/diary/kaichangtu\"},{\"text\":\"浙江回访思绪杂谈\",\"link\":\"/articles/notes/diary/zhejianghuifang\"},{\"text\":\"舍与得\",\"link\":\"/articles/notes/diary/sheyude\"},{\"text\":\"iPhone维修记\",\"link\":\"/articles/notes/diary/iphone7plus\"}]}]},{\"text\":\"读书笔记\",\"link\":\"/articles/notes/books/\",\"collapsed\":false,\"items\":[{\"text\":\"《大而不倒》读书笔记\",\"link\":\"/articles/notes/books/read-daerbudao\"}]},{\"text\":\"游记\",\"link\":\"/articles/notes/journal/\",\"collapsed\":false,\"items\":[{\"text\":\"西湖掠影\",\"link\":\"/articles/notes/journal/xihu\"},{\"text\":\"北坞秋日游记\",\"link\":\"/articles/notes/journal/beiwugongyuan\"}]},{\"text\":\"建站笔记\",\"link\":\"/articles/notes/website/\",\"collapsed\":false,\"items\":[{\"text\":\"Vitepress知识库博客\",\"link\":\"/articles/notes/website/to_vitepress\"},{\"text\":\"CDN缓存与隐私\",\"link\":\"/articles/notes/website/edgeonesecret\"},{\"text\":\"Fuwari+Waline\",\"link\":\"/articles/notes/website/walineforfuwari\"},{\"text\":\"博客搭建全流程\",\"link\":\"/articles/notes/website/hellovuepress\"}]}]},\"search\":{\"provider\":\"local\",\"options\":{\"miniSearch\":{\"options\":{\"tokenize\":\"_vp-fn_0\"},\"searchOptions\":{\"prefix\":true,\"fuzzy\":0.2,\"boost\":{\"title\":4,\"text\":2,\"titles\":1}}},\"translations\":{\"button\":{\"buttonText\":\"搜索文章\",\"buttonAriaLabel\":\"搜索文章\"},\"modal\":{\"noResultsText\":\"未找到相关结果\",\"resetButtonTitle\":\"清除查询条件\",\"displayDetails\":\"显示详细列表\",\"footer\":{\"selectText\":\"选择\",\"navigateText\":\"切换\",\"closeText\":\"关闭\"}}}}},\"outline\":{\"level\":[2,3],\"label\":\"本文目录\"},\"docFooter\":{\"prev\":\"上一篇\",\"next\":\"下一篇\"},\"returnToTopLabel\":\"回到顶部\",\"sidebarMenuLabel\":\"专题\",\"darkModeSwitchLabel\":\"主题\",\"lightModeSwitchTitle\":\"切换到亮色模式\",\"darkModeSwitchTitle\":\"切换到暗色模式\"},\"locales\":{},\"cleanUrls\":false,\"additionalConfig\":{}}"), [(function chineseFriendlyTokenize(text) {
	const tokens = [];
	const segments = text.match(/[\u4e00-\u9fff]+|[A-Za-z0-9]+/g) ?? [];
	for (const seg of segments) if (/[\u4e00-\u9fff]/.test(seg)) {
		if (seg.length === 1) tokens.push(seg);
		else for (let i = 0; i < seg.length - 1; i++) tokens.push(seg.slice(i, i + 2));
	} else tokens.push(seg.toLowerCase());
	return tokens;
})]);
//#endregion
//#region node_modules/vitepress/dist/client/app/data.js
var dataSymbol = Symbol();
var siteDataRef = shallowRef(readonly(_siteData_default));
function initData(route) {
	const site = computed(() => resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath, route.data.filePath));
	const appearance = site.value.appearance;
	const isDark = appearance === "force-dark" ? ref(true) : appearance === "force-auto" ? usePreferredDark() : appearance ? useDark({
		storageKey: APPEARANCE_KEY,
		initialValue: () => appearance === "dark" ? "dark" : "auto",
		...typeof appearance === "object" ? appearance : {}
	}) : ref(false);
	return {
		site,
		theme: computed(() => site.value.themeConfig),
		page: computed(() => route.data),
		frontmatter: computed(() => route.data.frontmatter),
		params: computed(() => route.data.params),
		lang: computed(() => site.value.lang),
		dir: computed(() => route.data.frontmatter.dir || site.value.dir),
		localeIndex: computed(() => site.value.localeIndex || "root"),
		title: computed(() => createTitle(site.value, route.data)),
		description: computed(() => route.data.description || site.value.description),
		isDark
	};
}
function useData$1() {
	const data = inject(dataSymbol);
	if (!data) throw new Error("vitepress data not properly injected in app");
	return data;
}
//#endregion
//#region node_modules/vitepress/dist/client/app/utils.js
var resolvedBase;
/**
* Runtime base path used by the app.
*
* Usually this is the configured site base.
*
* For a relative base (`'./'`), the mount point is unknown at build time, so:
* - SSR: uses `RELATIVE_BASE_SENTINEL` (for per-page URL relativization)
* - dev browser: uses `'/'` (dev server always mounts at root)
* - prod browser: resolves from the page's `__VP_SITE_ROOT__`
*/
function runtimeBase() {
	if (resolvedBase === void 0) {
		const base = siteDataRef.value.base;
		if (!isRelativeBase(base)) return resolvedBase = base;
		if (!inBrowser) return resolvedBase = RELATIVE_BASE_SENTINEL;
		const root = window.__VP_SITE_ROOT__;
		resolvedBase = root ? decodeURIComponent(new URL(root, location.href).pathname) : "/";
	}
	return resolvedBase;
}
/**
* Prepend base to internal (non-relative) urls
*/
function withBase(path) {
	return EXTERNAL_URL_RE.test(path) || !path.startsWith("/") ? path : joinPath(runtimeBase(), path);
}
/**
* Converts a url path to the corresponding js chunk filename.
*/
function pathToFile(path) {
	let pagePath = path.replace(/\.html$/, "");
	pagePath = decodeURIComponent(pagePath);
	pagePath = pagePath.replace(/\/$/, "/index");
	if (inBrowser) {
		const base = runtimeBase();
		if (pagePath + "/" === base) pagePath = base;
		if (!pagePath.startsWith(base)) return null;
		pagePath = sanitizeFileName(pagePath.slice(base.length).replace(/\//g, "_") || "index") + ".md";
		let pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
		if (!pageHash) {
			pagePath = pagePath.endsWith("_index.md") ? pagePath.slice(0, -9) + ".md" : pagePath.slice(0, -3) + "_index.md";
			pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
		}
		if (!pageHash) return null;
		pagePath = `${base}assets/${pagePath}.${pageHash}.js`;
	} else pagePath = `./${sanitizeFileName(pagePath.slice(1).replace(/\//g, "_"))}.md.js`;
	return pagePath;
}
var contentUpdatedCallbacks = [];
/**
* Register callback that is called every time the markdown content is updated
* in the DOM.
*/
function onContentUpdated(fn) {
	contentUpdatedCallbacks.push(fn);
	tryOnUnmounted(() => {
		contentUpdatedCallbacks = contentUpdatedCallbacks.filter((f) => f !== fn);
	});
}
//#endregion
//#region node_modules/vitepress/dist/client/app/composables/icon.js
/**
* Resolves an icon name (`collection:name`, e.g. `simple-icons:github`) to
* its `vpi-<collection>-<name>` class. During SSR the name is registered so
* the build emits its CSS rule; in dev the SVG is served on demand and
* applied to `el` inline.
*/
function useIcon(icon, el) {
	const parsed = computed(() => {
		const value = toValue(icon);
		return typeof value === "string" ? parseIconName(value) : null;
	});
	const iconClass = computed(() => parsed.value ? `vpi-${parsed.value.collection}-${parsed.value.icon}` : void 0);
	{
		const ctx = useSSRContext();
		const value = toValue(icon);
		if (typeof value === "string") ctx?.vpIcons.add(value);
	}
	return iconClass;
}
//#endregion
//#region node_modules/vitepress/dist/client/app/router.js
var RouterSymbol = Symbol();
var fakeHost = "http://a.com";
var getDefaultRoute = () => ({
	path: "/",
	hash: "",
	query: "",
	component: null,
	data: notFoundPageData
});
function createRouter(loadPageModule, fallbackComponent) {
	const route = reactive(getDefaultRoute());
	const router = {
		route,
		async go(href, options) {
			const { hash } = new URL(href, fakeHost);
			const hasTextFragment = inBrowser && document.fragmentDirective && hash.includes(":~:");
			href = normalizeHref(href);
			if (await router.onBeforeRouteChange?.(href) === false) return;
			if (!inBrowser || await changeRoute(href, {
				...options,
				hasTextFragment
			})) await loadPage(href, { initialLoad: !!options?.initialLoad });
			if (hasTextFragment) location.hash = hash;
			syncRouteQueryAndHash();
			await router.onAfterRouteChange?.(href);
		}
	};
	let latestPendingPath = null;
	async function loadPage(href, { scrollPosition = 0, isRetry = false, initialLoad = false } = {}) {
		if (await router.onBeforePageLoad?.(href) === false) return;
		const targetLoc = new URL(href, fakeHost);
		const pendingPath = latestPendingPath = targetLoc.pathname;
		try {
			let page = await loadPageModule(pendingPath);
			if (!page) throw new Error(`Page not found: ${pendingPath}`);
			if (latestPendingPath === pendingPath) {
				latestPendingPath = null;
				const { default: comp, __pageData } = page;
				if (!comp) throw new Error(`Invalid route component: ${comp}`);
				await router.onAfterPageLoad?.(href);
				route.path = inBrowser ? pendingPath : withBase(pendingPath);
				route.component = markRaw(comp);
				route.data = markRaw(__pageData);
				syncRouteQueryAndHash(targetLoc);
				if (inBrowser) nextTick(() => {
					let actualPathname = runtimeBase() + __pageData.relativePath.replace(/(?:(^|\/)index)?\.md$/, "$1");
					if (!siteDataRef.value.cleanUrls && !actualPathname.endsWith("/")) actualPathname += ".html";
					if (actualPathname !== targetLoc.pathname) {
						targetLoc.pathname = actualPathname;
						href = actualPathname + targetLoc.search + targetLoc.hash;
						history.replaceState({}, "", href);
					}
					if (!initialLoad) scrollTo(targetLoc.hash, scrollPosition);
				});
			}
		} catch (err) {
			if (!/fetch|Page not found/.test(err.message) && !/^\/404(\.html|\/)?$/.test(href)) console.error(err);
			if (!isRetry) try {
				const res = await fetch(runtimeBase() + "hashmap.json");
				window.__VP_HASH_MAP__ = await res.json();
				await loadPage(href, {
					scrollPosition,
					isRetry: true,
					initialLoad
				});
				return;
			} catch (e) {}
			if (latestPendingPath === pendingPath) {
				latestPendingPath = null;
				route.path = inBrowser ? pendingPath : withBase(pendingPath);
				route.component = fallbackComponent ? markRaw(fallbackComponent) : null;
				const relativePath = inBrowser ? route.path.replace(/(^|\/)$/, "$1index").replace(/(\.html)?$/, ".md").slice(runtimeBase().length) : "404.md";
				route.data = {
					...notFoundPageData,
					relativePath
				};
				syncRouteQueryAndHash(targetLoc);
			}
		}
	}
	function syncRouteQueryAndHash(loc = inBrowser ? location : {
		search: "",
		hash: ""
	}) {
		route.query = loc.search;
		route.hash = decodeURIComponent(loc.hash);
	}
	if (inBrowser) {
		if (history.state === null) history.replaceState({}, "");
		window.addEventListener("click", (e) => {
			if (e.defaultPrevented || !(e.target instanceof Element) || e.target.closest("button") || e.button !== 0 || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
			const link = e.target.closest("a");
			if (!link || link.closest(".vp-raw") || link.hasAttribute("download") || link.hasAttribute("target")) return;
			const linkHref = link.getAttribute("href") ?? (link instanceof SVGAElement ? link.getAttribute("xlink:href") : null);
			if (linkHref == null) return;
			const { href, origin, pathname } = new URL(linkHref, link.baseURI);
			if (origin === new URL(location.href).origin && treatAsHtml(pathname)) {
				e.preventDefault();
				router.go(href);
			}
		}, { capture: true });
		window.addEventListener("popstate", async (e) => {
			if (e.state === null) return;
			const href = normalizeHref(location.href);
			await loadPage(href, { scrollPosition: e.state.scrollPosition || 0 });
			syncRouteQueryAndHash();
			await router.onAfterRouteChange?.(href);
		});
		window.addEventListener("hashchange", (e) => {
			e.preventDefault();
			syncRouteQueryAndHash();
		});
	}
	return router;
}
function useRouter() {
	const router = inject(RouterSymbol);
	if (!router) throw new Error("useRouter() is called without provider.");
	return router;
}
function useRoute() {
	return useRouter().route;
}
function scrollTo(hash, scrollPosition = 0) {
	if (!hash || scrollPosition) {
		window.scrollTo(0, scrollPosition);
		return;
	}
	let target = null;
	try {
		target = document.getElementById(decodeURIComponent(hash).slice(1));
	} catch (e) {
		console.warn(e);
	}
	if (!target) return;
	const scrollToTarget = () => {
		target.scrollIntoView({ block: "start" });
		target.focus({ preventScroll: true });
		if (document.activeElement === target) return;
		if (target.hasAttribute("tabindex")) return;
		const restoreTabindex = () => {
			target.removeAttribute("tabindex");
			target.removeEventListener("blur", restoreTabindex);
		};
		target.setAttribute("tabindex", "-1");
		target.addEventListener("blur", restoreTabindex);
		target.focus({ preventScroll: true });
		if (document.activeElement !== target) restoreTabindex();
	};
	requestAnimationFrame(scrollToTarget);
}
function normalizeHref(href) {
	const url = new URL(href, fakeHost);
	url.pathname = url.pathname.replace(/(^|\/)index(\.html)?$/, "$1");
	if (siteDataRef.value.cleanUrls) url.pathname = url.pathname.replace(/\.html$/, "");
	else if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) url.pathname += ".html";
	return url.pathname + url.search + url.hash.split(":~:")[0];
}
async function changeRoute(href, { initialLoad = false, replace = false, hasTextFragment = false } = {}) {
	const loc = normalizeHref(location.href);
	const nextUrl = new URL(href, location.origin);
	const currentUrl = new URL(loc, location.origin);
	if (href === loc) {
		if (!initialLoad) {
			if (!hasTextFragment) scrollTo(nextUrl.hash);
			return false;
		}
	} else {
		if (replace) history.replaceState({}, "", href);
		else {
			history.replaceState({ scrollPosition: window.scrollY }, "");
			history.pushState({}, "", href);
		}
		if (nextUrl.pathname === currentUrl.pathname) {
			if (nextUrl.hash !== currentUrl.hash) {
				window.dispatchEvent(new HashChangeEvent("hashchange", {
					oldURL: currentUrl.href,
					newURL: nextUrl.href
				}));
				if (!hasTextFragment) scrollTo(nextUrl.hash);
			}
			return false;
		}
	}
	return true;
}
//#endregion
//#region node_modules/vitepress/dist/client/app/components/Content.js
var runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn());
var Content = defineComponent({
	name: "VitePressContent",
	props: { as: {
		type: [Object, String],
		default: "div"
	} },
	setup(props) {
		const { frontmatter, site } = useData$1();
		const route = useRoute();
		watch(frontmatter, runCbs, {
			deep: true,
			flush: "post"
		});
		return () => h(props.as, site.value.contentProps ?? { style: { position: "relative" } }, [route.component ? h(route.component, {
			onVnodeMounted: runCbs,
			onVnodeUpdated: runCbs,
			onVnodeUnmounted: runCbs
		}) : "404 Page Not Found"]);
	}
});
//#endregion
//#region node_modules/vitepress/dist/client/app/composables/codeGroups.js
function useCodeGroups() {
	if (inBrowser) window.addEventListener("click", (e) => {
		const el = e.target;
		if (el.matches(".vp-code-group input")) {
			const group = el.parentElement?.parentElement;
			if (!group) return;
			const i = Array.from(group.querySelectorAll("input")).indexOf(el);
			if (i < 0) return;
			const blocks = group.querySelector(".blocks");
			if (!blocks) return;
			const current = Array.from(blocks.children).find((child) => child.classList.contains("active"));
			if (!current) return;
			const next = blocks.children[i];
			if (!next || current === next) return;
			current.classList.remove("active");
			activate(next);
			(group?.querySelector(`label[for="${el.id}"]`))?.scrollIntoView({ block: "nearest" });
		}
	});
}
function activate(el) {
	el.classList.add("active");
	window.dispatchEvent(new CustomEvent("vitepress:codeGroupTabActivate", { detail: el }));
}
//#endregion
//#region node_modules/vitepress/dist/client/app/composables/copyCode.js
var ignoredNodes = [".vp-copy-ignore", ".diff.remove"].join(", ");
function useCopyCode() {
	if (inBrowser) {
		const timeoutIdMap = /* @__PURE__ */ new WeakMap();
		window.addEventListener("click", (e) => {
			const el = e.target;
			if (el.matches("div[class*=\"language-\"] > button.copy")) {
				const parent = el.parentElement;
				const sibling = el.nextElementSibling?.nextElementSibling;
				if (!parent || !sibling) return;
				const clone = sibling.cloneNode(true);
				clone.querySelectorAll(ignoredNodes).forEach((node) => node.remove());
				clone.innerHTML = clone.innerHTML.replace(/\n+/g, "\n");
				let text = clone.textContent || "";
				if (isShell(/language-(\w+)/.exec(parent.className)?.[1] || "")) text = text.replace(/^ *(\$|>) /gm, "").trim();
				copyToClipboard(text).then(() => {
					el.classList.add("copied");
					clearTimeout(timeoutIdMap.get(el));
					const timeoutId = window.setTimeout(() => {
						el.classList.remove("copied");
						el.blur();
						timeoutIdMap.delete(el);
					}, 2e3);
					timeoutIdMap.set(el, timeoutId);
				});
			}
		});
	}
}
async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		const element = document.createElement("textarea");
		const previouslyFocusedElement = document.activeElement;
		element.value = text;
		element.setAttribute("readonly", "");
		element.style.contain = "strict";
		element.style.position = "absolute";
		element.style.left = "-9999px";
		element.style.fontSize = "12pt";
		const selection = document.getSelection();
		const originalRange = selection ? selection.rangeCount > 0 && selection.getRangeAt(0) : null;
		document.body.appendChild(element);
		element.select();
		element.selectionStart = 0;
		element.selectionEnd = text.length;
		document.execCommand("copy");
		document.body.removeChild(element);
		if (originalRange) {
			selection.removeAllRanges();
			selection.addRange(originalRange);
		}
		if (previouslyFocusedElement) previouslyFocusedElement.focus();
	}
}
//#endregion
//#region node_modules/vitepress/dist/client/app/composables/head.js
function useUpdateHead(route, siteDataByRouteRef) {
	let isFirstUpdate = true;
	let managedHeadElements = [];
	const updateHeadTags = (newTags) => {
		if (isFirstUpdate) {
			isFirstUpdate = false;
			newTags.forEach((tag) => {
				const headEl = createHeadElement(tag);
				for (const el of document.head.children) if (el.isEqualNode(headEl)) {
					managedHeadElements.push(el);
					return;
				}
			});
			return;
		}
		const newElements = newTags.map(createHeadElement);
		managedHeadElements.forEach((oldEl, oldIndex) => {
			const matchedIndex = newElements.findIndex((newEl) => newEl?.isEqualNode(oldEl ?? null));
			if (matchedIndex !== -1) delete newElements[matchedIndex];
			else {
				oldEl?.remove();
				delete managedHeadElements[oldIndex];
			}
		});
		newElements.forEach((el) => el && document.head.appendChild(el));
		managedHeadElements = [...managedHeadElements, ...newElements].filter(Boolean);
	};
	watchEffect(() => {
		const pageData = route.data;
		const siteData = siteDataByRouteRef.value;
		const pageDescription = pageData && pageData.description;
		const frontmatterHead = pageData && pageData.frontmatter.head || [];
		const title = createTitle(siteData, pageData);
		if (title !== document.title) document.title = title;
		const description = pageDescription || siteData.description;
		let metaDescriptionElement = document.querySelector(`meta[name=description]`);
		if (metaDescriptionElement) {
			if (metaDescriptionElement.getAttribute("content") !== description) metaDescriptionElement.setAttribute("content", description);
		} else createHeadElement(["meta", {
			name: "description",
			content: description
		}]);
		updateHeadTags(mergeHead(siteData.head, filterOutHeadDescription(frontmatterHead)));
	});
}
function createHeadElement([tag, attrs, innerHTML]) {
	const el = document.createElement(tag);
	for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
	if (innerHTML) el.innerHTML = innerHTML;
	if (tag === "script" && attrs.async == null) el.async = false;
	return el;
}
function isMetaDescription(headConfig) {
	return headConfig[0] === "meta" && headConfig[1] && headConfig[1].name === "description";
}
function filterOutHeadDescription(head) {
	return head.filter((h) => !isMetaDescription(h));
}
//#endregion
//#region node_modules/vitepress/dist/client/app/composables/preFetch.js
var hasFetched = /* @__PURE__ */ new Set();
var createLink = () => document.createElement("link");
var viaDOM = (url) => {
	const link = createLink();
	link.rel = `prefetch`;
	if (EXTERNAL_URL_RE.test(url)) link.crossOrigin = "";
	link.href = url;
	document.head.appendChild(link);
};
var viaXHR = (url) => {
	const req = new XMLHttpRequest();
	req.open("GET", url, true);
	req.withCredentials = !EXTERNAL_URL_RE.test(url);
	req.send();
};
var link;
var doFetch = inBrowser && (link = createLink()) && link.relList && link.relList.supports && link.relList.supports("prefetch") ? viaDOM : viaXHR;
function usePrefetch() {
	if (!inBrowser) return;
	if (!window.IntersectionObserver) return;
	let conn;
	if ((conn = navigator.connection) && (conn.saveData || /2g/.test(conn.effectiveType))) return;
	const rIC = window.requestIdleCallback || setTimeout;
	let observer = null;
	const observeLinks = () => {
		if (observer) observer.disconnect();
		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const link = entry.target;
					observer.unobserve(link);
					const { pathname } = link;
					if (!hasFetched.has(pathname)) {
						hasFetched.add(pathname);
						const pageChunkPath = pathToFile(pathname);
						if (pageChunkPath) doFetch(pageChunkPath);
					}
				}
			});
		});
		rIC(() => {
			document.querySelectorAll("#app a").forEach((link) => {
				const { hostname, pathname } = new URL(link.href instanceof SVGAnimatedString ? link.href.animVal : link.href, link.baseURI);
				const extMatch = pathname.match(/\.\w+$/);
				if (extMatch && extMatch[0] !== ".html") return;
				if (link.target !== "_blank" && hostname === location.hostname) {
					if (pathname !== location.pathname) observer.observe(link);
					else hasFetched.add(pathname);
				}
			});
		});
	};
	onMounted(observeLinks);
	const route = useRoute();
	watch(() => route.path, observeLinks);
	onUnmounted(() => {
		observer && observer.disconnect();
	});
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/data.js
var useData = useData$1;
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/support/utils.js
function throttleAndDebounce(fn, delay) {
	let timeoutId;
	let called = false;
	return () => {
		if (timeoutId) clearTimeout(timeoutId);
		if (!called) {
			fn();
			(called = true) && window.setTimeout(() => called = false, delay);
		} else timeoutId = window.setTimeout(fn, delay);
	};
}
function ensureStartingSlash(path) {
	return path.startsWith("/") ? path : `/${path}`;
}
function isLinkExternal(href, target, external) {
	if (external !== void 0) return external;
	return !!href && isExternal(href) || target === "_blank";
}
function normalizeLink$1(url) {
	const { pathname, search, hash, protocol } = new URL(url, "http://a.com");
	if (isExternal(url) || url.startsWith("#") || !protocol.startsWith("http") || !treatAsHtml(pathname)) return url;
	const { site } = useData();
	let normalizedPath = pathname.endsWith("/") || pathname.endsWith(".html") ? url : url.replace(/(?:(^\.+)\/)?.*$/, `$1${pathname.replace(/(\.md)?$/, site.value.cleanUrls ? "" : ".html")}${search}${hash}`);
	if (isRelativeBase(site.value.base) && !site.value.cleanUrls) {
		const pathPart = normalizedPath.replace(/[?#].*$/, "");
		if (pathPart.endsWith("/")) normalizedPath = pathPart + "index.html" + normalizedPath.slice(pathPart.length);
	}
	return withBase(normalizedPath);
}
function uniqBy(array, keyFn) {
	const seen = /* @__PURE__ */ new Set();
	return array.filter((item) => {
		const k = keyFn(item);
		return seen.has(k) ? false : seen.add(k);
	});
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/support/sidebar.js
/**
* Get the `Sidebar` from sidebar option. This method will ensure to get correct
* sidebar config from `MultiSideBarConfig` with various path combinations such
* as matching `guide/` and `/guide/`. If no matching config was found, it will
* return empty array.
*/
function getSidebar(_sidebar, path) {
	if (Array.isArray(_sidebar)) return addBase(_sidebar);
	if (_sidebar == null) return [];
	path = ensureStartingSlash(path);
	const dir = Object.keys(_sidebar).sort((a, b) => {
		return b.split("/").length - a.split("/").length;
	}).find((dir) => {
		return path.startsWith(ensureStartingSlash(dir));
	});
	const sidebar = dir ? _sidebar[dir] ?? [] : [];
	return Array.isArray(sidebar) ? addBase(sidebar) : addBase(sidebar.items, sidebar.base);
}
/**
* Get or generate sidebar group from the given sidebar items.
*/
function getSidebarGroups(sidebar) {
	const groups = [];
	let lastGroupIndex = 0;
	for (const item of sidebar) {
		if (item.items) {
			lastGroupIndex = groups.push(item);
			continue;
		}
		let group = groups[lastGroupIndex];
		if (!group) {
			group = { items: [] };
			groups.push(group);
		}
		group.items?.push(item);
	}
	return groups;
}
function getFlatSideBarLinks(sidebar) {
	const links = [];
	function recursivelyExtractLinks(items) {
		for (const item of items) {
			if (item.text && item.link) links.push({
				text: item.text,
				link: item.link,
				docFooterText: item.docFooterText,
				rel: item.rel,
				target: item.target
			});
			if (item.items) recursivelyExtractLinks(item.items);
		}
	}
	recursivelyExtractLinks(sidebar);
	return links;
}
/**
* Check if the given sidebar item contains any active link.
*/
function hasActiveLink(path, hash, items, skipHashCheck = false) {
	if (Array.isArray(items)) return items.some((item) => hasActiveLink(path, hash, item, skipHashCheck));
	if (items.link && isActive(path, hash, items.link, false, skipHashCheck)) return true;
	if (items.items) return hasActiveLink(path, hash, items.items, skipHashCheck);
	return false;
}
function addBase(items, _base) {
	return [...items].map((_item) => {
		const item = { ..._item };
		const base = item.base || _base;
		if (base && item.link && !isExternal(item.link)) item.link = base + item.link.replace(/^\//, base.endsWith("/") ? "" : "/");
		if (item.items) item.items = addBase(item.items, base);
		return item;
	});
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/outline.js
var ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/;
var resolvedHeaders = [];
function resolveTitle(theme) {
	return typeof theme.outline === "object" && !Array.isArray(theme.outline) && theme.outline.label || "On this page";
}
function getHeaders(range) {
	return resolveHeaders([...document.querySelectorAll(".VPDoc h1, .VPDoc h2, .VPDoc h3, .VPDoc h4, .VPDoc h5, .VPDoc h6")].filter((el) => el.id && el.hasChildNodes()).map((el) => {
		const level = Number(el.tagName[1]);
		return {
			element: el,
			title: serializeHeader(el),
			link: "#" + el.id,
			level
		};
	}), range);
}
function serializeHeader(h) {
	let ret = "";
	for (const node of h.childNodes) if (node.nodeType === 1) {
		if (ignoreRE.test(node.className)) continue;
		ret += node.textContent;
	} else if (node.nodeType === 3) ret += node.textContent;
	return ret.trim();
}
function resolveHeaders(headers, range) {
	if (range === false) return [];
	const levelsRange = (typeof range === "object" && !Array.isArray(range) ? range.level : range) || 2;
	const [high, low] = typeof levelsRange === "number" ? [levelsRange, levelsRange] : levelsRange === "deep" ? [2, 6] : levelsRange;
	return buildTree(headers, high, low);
}
function useActiveAnchor(container, marker) {
	const isAsideVisible = useMediaQuery("(min-width: 80rem)");
	const onScroll = throttleAndDebounce(setActiveLink, 100);
	let prevActiveLink = null;
	let ignoreScrollOnce = false;
	onMounted(() => {
		requestAnimationFrame(setActiveLink);
		window.addEventListener("scroll", onScroll);
		container.value?.addEventListener("click", onClick);
	});
	onUpdated(() => {
		activateLink(location.hash);
	});
	onUnmounted(() => {
		window.removeEventListener("scroll", onScroll);
	});
	function onClick(e) {
		if (!isAsideVisible.value) return;
		const hash = e.target instanceof Element ? e.target.closest("a")?.hash : null;
		if (hash) {
			ignoreScrollOnce = true;
			activateLink(hash);
		}
	}
	function setActiveLink() {
		if (!isAsideVisible.value) return;
		if (ignoreScrollOnce) {
			ignoreScrollOnce = false;
			return;
		}
		const scrollY = window.scrollY;
		const innerHeight = window.innerHeight;
		const offsetHeight = document.body.offsetHeight;
		const isBottom = scrollY + innerHeight - offsetHeight >= 0;
		const headers = resolvedHeaders.map(({ element, link }) => ({
			link,
			top: getAbsoluteTop(element),
			scrollMarginTop: Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0
		})).filter(({ top }) => !Number.isNaN(top)).sort((a, b) => a.top - b.top);
		if (!headers.length) {
			activateLink(null);
			return;
		}
		if (scrollY < 1) {
			activateLink(null);
			return;
		}
		if (isBottom) {
			activateLink(headers.at(-1)?.link ?? null);
			return;
		}
		let activeLink = null;
		for (const { link, top, scrollMarginTop } of headers) {
			if (top > scrollY + scrollMarginTop + 4) break;
			activeLink = link;
		}
		activateLink(activeLink);
	}
	function activateLink(hash) {
		const activeLink = hash != null ? container.value?.querySelector(`a[href$="${decodeURIComponent(hash)}"]`) ?? null : null;
		if (activeLink === prevActiveLink) return;
		prevActiveLink?.classList.remove("active");
		prevActiveLink = activeLink;
		if (activeLink) {
			activeLink.classList.add("active");
			if (marker.value) {
				marker.value.style.top = activeLink.offsetTop + (activeLink.offsetParent?.offsetTop ?? 0) + (activeLink.offsetHeight - marker.value.offsetHeight) / 2 + "px";
				marker.value.style.opacity = "1";
			}
			activeLink.scrollIntoView({
				block: "nearest",
				behavior: "smooth"
			});
		} else if (marker.value) {
			marker.value.style.top = "";
			marker.value.style.opacity = "0";
		}
	}
}
function getAbsoluteTop(element) {
	let offsetTop = 0;
	while (element !== document.body) {
		if (element === null) return NaN;
		offsetTop += element.offsetTop;
		element = element.offsetParent;
	}
	return offsetTop;
}
function buildTree(data, min, max) {
	resolvedHeaders.length = 0;
	const result = [];
	const stack = [];
	data.forEach((item) => {
		const node = {
			...item,
			children: []
		};
		let parent = stack[stack.length - 1];
		while (parent && parent.level >= node.level) {
			stack.pop();
			parent = stack[stack.length - 1];
		}
		if (node.element.classList.contains("ignore-header") || parent && "shouldIgnore" in parent) {
			stack.push({
				level: node.level,
				shouldIgnore: true
			});
			return;
		}
		if (node.level > max || node.level < min) return;
		resolvedHeaders.push({
			element: node.element,
			link: node.link
		});
		if (parent) parent.children.push(node);
		else result.push(node);
		stack.push(node);
	});
	return result;
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/sidebar.js
var isOpen = ref(false);
/**
* a11y: cache the element that opened the Sidebar (the menu button) then
* focus that button again when Menu is closed with Escape key.
*/
function useCloseSidebarOnEscape(close) {
	let triggerElement;
	watchEffect(() => {
		triggerElement = isOpen.value ? document.activeElement : void 0;
	});
	onMounted(() => {
		window.addEventListener("keyup", onEscape);
	});
	onUnmounted(() => {
		window.removeEventListener("keyup", onEscape);
	});
	function onEscape(e) {
		if (e.key === "Escape" && isOpen.value) {
			close();
			triggerElement?.focus();
		}
	}
}
function useSidebarControl() {
	function open() {
		isOpen.value = true;
	}
	function close() {
		isOpen.value = false;
	}
	function toggle() {
		isOpen.value ? close() : open();
	}
	return {
		isOpen,
		open,
		close,
		toggle
	};
}
function useSidebarItemControl(item) {
	const route = useRoute();
	const collapsed = ref(false);
	const collapsible = computed(() => {
		return item.value.collapsed != null;
	});
	const isLink = computed(() => {
		return !!item.value.link;
	});
	const isActiveLink = ref(false);
	const hasActiveLink$1 = ref(false);
	function updateActiveLink(skipHashCheck = false) {
		if (item.value.link) isActiveLink.value = isActive(route.data.relativePath, route.hash, item.value.link, false, skipHashCheck);
		else isActiveLink.value = false;
		if (isActiveLink.value) {
			hasActiveLink$1.value = true;
			nextTick(() => collapsed.value = false);
			return;
		}
		if (!item.value.items) {
			hasActiveLink$1.value = false;
			return;
		}
		hasActiveLink$1.value = hasActiveLink(route.data.relativePath, route.hash, item.value.items, skipHashCheck);
		if (hasActiveLink$1.value) nextTick(() => collapsed.value = false);
	}
	updateActiveLink(true);
	watch([item, route], () => updateActiveLink());
	onMounted(() => updateActiveLink());
	const isCurrentLink = computed(() => {
		return item.value.link ? isActive(route.data.relativePath, route.hash, item.value.link) : false;
	});
	const hasChildren = computed(() => {
		return !!(item.value.items && item.value.items.length);
	});
	watchEffect(() => {
		collapsed.value = !!(collapsible.value && item.value.collapsed);
	});
	function toggle() {
		if (collapsible.value) collapsed.value = !collapsed.value;
	}
	return {
		collapsed,
		collapsible,
		isLink,
		isActiveLink,
		isCurrentLink,
		hasActiveLink: hasActiveLink$1,
		hasChildren,
		toggle
	};
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/layout.js
var headers = shallowRef([]);
var sidebar = shallowRef([]);
var isDesktop = useMediaQuery("(min-width: 60rem)");
function useLayout() {
	const { frontmatter, theme } = useData();
	const isHome = computed(() => {
		return !!(frontmatter.value.isHome ?? frontmatter.value.layout === "home");
	});
	const hasSidebar = computed(() => {
		return frontmatter.value.sidebar !== false && sidebar.value.length > 0 && !isHome.value;
	});
	const isSidebarEnabled = computed(() => hasSidebar.value && isDesktop.value);
	const sidebarGroups = computed(() => {
		return hasSidebar.value ? getSidebarGroups(sidebar.value) : [];
	});
	const hasAside = computed(() => {
		if (isHome.value) return false;
		if (frontmatter.value.aside != null) return !!frontmatter.value.aside;
		return theme.value.aside !== false;
	});
	const leftAside = computed(() => {
		if (!hasAside.value) return false;
		return frontmatter.value.aside == null ? theme.value.aside === "left" : frontmatter.value.aside === "left";
	});
	const hasLocalNav = computed(() => {
		return headers.value.length > 0;
	});
	return {
		isHome,
		sidebar: shallowReadonly(sidebar),
		sidebarGroups,
		hasSidebar,
		isSidebarEnabled,
		hasAside,
		leftAside,
		headers: shallowReadonly(headers),
		hasLocalNav
	};
}
function registerWatchers({ closeSidebar }) {
	const { theme, page, frontmatter } = useData();
	watch(() => [page.value.relativePath, theme.value.sidebar], ([relativePath, sidebarConfig]) => {
		const newSidebar = sidebarConfig ? getSidebar(sidebarConfig, relativePath) : [];
		if (JSON.stringify(newSidebar) !== JSON.stringify(sidebar.value)) sidebar.value = newSidebar;
	}, {
		immediate: true,
		deep: true,
		flush: "sync"
	});
	onContentUpdated(() => {
		headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline);
	});
	const route = useRoute();
	watch(() => route.path, closeSidebar);
	watch(isDesktop, closeSidebar);
	useCloseSidebarOnEscape(closeSidebar);
}
var layoutInfoInjectionKey = Symbol("layout-info");
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue
var _sfc_main$72 = {
	__name: "VPBadge",
	__ssrInlineRender: true,
	props: {
		text: {
			type: String,
			required: false
		},
		type: {
			type: String,
			required: false,
			default: "tip"
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<span${ssrRenderAttrs(mergeProps({ class: ["VPBadge", __props.type] }, _attrs))}>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, () => {
				_push(`${ssrInterpolate(__props.text)}`);
			}, _push, _parent);
			_push(`</span>`);
		};
	}
};
var _sfc_setup$72 = _sfc_main$72.setup;
_sfc_main$72.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue");
	return _sfc_setup$72 ? _sfc_setup$72(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue
var _sfc_main$71 = {
	__name: "VPBackdrop",
	__ssrInlineRender: true,
	props: { show: {
		type: Boolean,
		required: true
	} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.show) _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPBackdrop" }, _attrs))} data-v-2d6ee955></div>`);
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$71 = _sfc_main$71.setup;
_sfc_main$71.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue");
	return _sfc_setup$71 ? _sfc_setup$71(props, ctx) : void 0;
};
var VPBackdrop_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$71, [["__scopeId", "data-v-2d6ee955"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/langs.js
function useLangs({ linkToCorrespondingPage = false } = {}) {
	const data = useData();
	const route = useRoute();
	const { site, localeIndex } = data;
	const currentLang = computed(() => ({
		label: site.value.locales[localeIndex.value]?.label,
		link: site.value.locales[localeIndex.value]?.link || (localeIndex.value === "root" ? "/" : `/${localeIndex.value}/`)
	}));
	return {
		currentLang,
		localeLinks: computed(() => Object.entries(site.value.locales).flatMap(([key, value]) => currentLang.value.label === value.label ? [] : {
			text: value.label,
			link: resolveLocaleLink(data, route, {
				targetLocale: key,
				targetLocaleLink: value.link || (key === "root" ? "/" : `/${key}/`),
				currentLocaleLink: currentLang.value.link,
				linkToCorrespondingPage
			}),
			lang: value.lang,
			dir: value.dir
		}))
	};
}
/**
* Resolves the link used for switching from the current page to
* `targetLocale`. Without `linkToCorrespondingPage`, this is simply the home
* of the target locale. With it, the current page's path is rewritten into
* the target locale (honoring `cleanUrls`) — unless
* `themeConfig.i18nRouting` is `false` (the locale home is used instead) or
* a function (which then fully controls the resolution).
*
* The current query and hash are carried over, except when a custom
* `i18nRouting` function is used.
*/
function resolveLocaleLink(data, route, { targetLocale, targetLocaleLink, currentLocaleLink, linkToCorrespondingPage }) {
	const { site, theme } = data;
	const i18nRouting = theme.value.i18nRouting;
	if (linkToCorrespondingPage && typeof i18nRouting === "function") return i18nRouting(data, route, targetLocale);
	return normalizeLink(targetLocaleLink, i18nRouting !== false && linkToCorrespondingPage, route.data.relativePath.slice(currentLocaleLink.length - 1), !site.value.cleanUrls) + route.query + route.hash;
}
function normalizeLink(localeLink, appendPagePath, pagePath, addHtmlExt) {
	return appendPagePath ? localeLink.replace(/\/$/, "") + ensureStartingSlash(pagePath.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, addHtmlExt ? ".html" : "")) : localeLink;
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/NotFound.vue
var _sfc_main$70 = {
	__name: "NotFound",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const { currentLang } = useLangs();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "NotFound" }, _attrs))} data-v-de3cd469><p class="code" data-v-de3cd469>${ssrInterpolate(unref(theme).notFound?.code ?? "404")}</p><h1 class="title" data-v-de3cd469>${ssrInterpolate(unref(theme).notFound?.title ?? "PAGE NOT FOUND")}</h1><div class="divider" data-v-de3cd469></div><blockquote class="quote" data-v-de3cd469>${ssrInterpolate(unref(theme).notFound?.quote ?? "But if you don't change your direction, and if you keep looking, you may end up where you are heading.")}</blockquote><div class="action" data-v-de3cd469><a class="link"${ssrRenderAttr("href", unref(withBase)(unref(theme).notFound?.link ?? unref(currentLang).link))}${ssrRenderAttr("aria-label", unref(theme).notFound?.linkLabel ?? "go to home")} data-v-de3cd469>${ssrInterpolate(unref(theme).notFound?.linkText ?? "Take me home")}</a></div></div>`);
		};
	}
};
var _sfc_setup$70 = _sfc_main$70.setup;
_sfc_main$70.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/NotFound.vue");
	return _sfc_setup$70 ? _sfc_setup$70(props, ctx) : void 0;
};
var NotFound_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$70, [["__scopeId", "data-v-de3cd469"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue
var _sfc_main$69 = {
	__name: "VPDocAsideCarbonAds",
	__ssrInlineRender: true,
	props: { carbonAds: {
		type: Object,
		required: true
	} },
	setup(__props) {
		const VPCarbonAds = () => null;
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAsideCarbonAds" }, _attrs))}>`);
			_push(ssrRenderComponent(unref(VPCarbonAds), { "carbon-ads": __props.carbonAds }, null, _parent));
			_push(`</div>`);
		};
	}
};
var _sfc_setup$69 = _sfc_main$69.setup;
_sfc_main$69.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue");
	return _sfc_setup$69 ? _sfc_setup$69(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue
var _sfc_main$68 = {
	__name: "VPDocOutlineItem",
	__ssrInlineRender: true,
	props: {
		headers: {
			type: Array,
			required: true
		},
		root: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPDocOutlineItem = resolveComponent("VPDocOutlineItem", true);
			_push(`<ul${ssrRenderAttrs(mergeProps({ class: ["VPDocOutlineItem", __props.root ? "root" : "nested"] }, _attrs))} data-v-36c863a6><!--[-->`);
			ssrRenderList(__props.headers, ({ children, link, title }) => {
				_push(`<li data-v-36c863a6><a class="outline-link"${ssrRenderAttr("href", link)}${ssrRenderAttr("title", title)} data-v-36c863a6>${ssrInterpolate(title)}</a>`);
				if (children?.length) _push(ssrRenderComponent(_component_VPDocOutlineItem, { headers: children }, null, _parent));
				else _push(`<!---->`);
				_push(`</li>`);
			});
			_push(`<!--]--></ul>`);
		};
	}
};
var _sfc_setup$68 = _sfc_main$68.setup;
_sfc_main$68.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue");
	return _sfc_setup$68 ? _sfc_setup$68(props, ctx) : void 0;
};
var VPDocOutlineItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$68, [["__scopeId", "data-v-36c863a6"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue
var _sfc_main$67 = {
	__name: "VPDocAsideOutline",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const container = useTemplateRef("container");
		const marker = useTemplateRef("marker");
		const { headers, hasLocalNav } = useLayout();
		useActiveAnchor(container, marker);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<nav${ssrRenderAttrs(mergeProps({
				"aria-labelledby": "doc-outline-aria-label",
				class: ["VPDocAsideOutline", { "has-outline": unref(hasLocalNav) }],
				ref_key: "container",
				ref: container
			}, _attrs))} data-v-df5b2de9><div class="content" data-v-df5b2de9><div class="outline-marker" data-v-df5b2de9></div><div aria-level="2" class="outline-title" id="doc-outline-aria-label" role="heading" data-v-df5b2de9>${ssrInterpolate(unref(resolveTitle)(unref(theme)))}</div>`);
			_push(ssrRenderComponent(VPDocOutlineItem_default, {
				headers: unref(headers),
				root: true
			}, null, _parent));
			_push(`</div></nav>`);
		};
	}
};
var _sfc_setup$67 = _sfc_main$67.setup;
_sfc_main$67.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue");
	return _sfc_setup$67 ? _sfc_setup$67(props, ctx) : void 0;
};
var VPDocAsideOutline_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$67, [["__scopeId", "data-v-df5b2de9"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue
var _sfc_main$66 = {
	__name: "VPDocAside",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAside" }, _attrs))} data-v-5ef2eff3>`);
			ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPDocAsideOutline_default, null, null, _parent));
			ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent);
			_push(`<div class="spacer" data-v-5ef2eff3></div>`);
			ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent);
			if (unref(theme).carbonAds) _push(ssrRenderComponent(_sfc_main$69, { "carbon-ads": unref(theme).carbonAds }, null, _parent));
			else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$66 = _sfc_main$66.setup;
_sfc_main$66.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue");
	return _sfc_setup$66 ? _sfc_setup$66(props, ctx) : void 0;
};
var VPDocAside_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$66, [["__scopeId", "data-v-5ef2eff3"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/edit-link.js
function useEditLink() {
	const { theme, page } = useData();
	return computed(() => {
		const { text = "Edit this page", pattern = "" } = theme.value.editLink || {};
		let url;
		if (typeof pattern === "function") url = pattern(page.value);
		else url = pattern.replace(/:path/g, page.value.filePath);
		return {
			url,
			text
		};
	});
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/prev-next.js
function usePrevNext() {
	const { theme, page, frontmatter } = useData();
	return computed(() => {
		const candidates = uniqBy(getFlatSideBarLinks(getSidebar(theme.value.sidebar, page.value.relativePath)), (link) => normalize(link.link));
		const index = candidates.findIndex((link) => {
			return isActive(page.value.relativePath, "", link.link, false, true);
		});
		const hidePrev = theme.value.docFooter?.prev === false && !frontmatter.value.prev || frontmatter.value.prev === false;
		const hideNext = theme.value.docFooter?.next === false && !frontmatter.value.next || frontmatter.value.next === false;
		return {
			prev: hidePrev ? void 0 : {
				text: (typeof frontmatter.value.prev === "string" ? frontmatter.value.prev : typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.text : void 0) ?? candidates[index - 1]?.docFooterText ?? candidates[index - 1]?.text,
				link: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.link : void 0) ?? candidates[index - 1]?.link,
				target: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.target : void 0) ?? candidates[index - 1]?.target,
				rel: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.rel : void 0) ?? candidates[index - 1]?.rel
			},
			next: hideNext ? void 0 : {
				text: (typeof frontmatter.value.next === "string" ? frontmatter.value.next : typeof frontmatter.value.next === "object" ? frontmatter.value.next.text : void 0) ?? candidates[index + 1]?.docFooterText ?? candidates[index + 1]?.text,
				link: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.link : void 0) ?? candidates[index + 1]?.link,
				target: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.target : void 0) ?? candidates[index + 1]?.target,
				rel: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.rel : void 0) ?? candidates[index + 1]?.rel
			}
		};
	});
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue
var _sfc_main$65 = {
	__name: "VPDocFooterLastUpdated",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, page, lang: pageLang } = useData();
		const { language: browserLang } = useNavigatorLanguage();
		const timeRef = useTemplateRef("timeRef");
		const date = computed(() => new Date(page.value.lastUpdated));
		const isoDatetime = computed(() => date.value.toISOString());
		const datetime = shallowRef("");
		onMounted(() => {
			watchEffect(() => {
				const lang = theme.value.lastUpdated?.formatOptions?.forceLocale ? pageLang.value : browserLang.value;
				datetime.value = new Intl.DateTimeFormat(lang, theme.value.lastUpdated?.formatOptions ?? {
					dateStyle: "medium",
					timeStyle: "medium"
				}).format(date.value);
				if (lang && pageLang.value !== lang) timeRef.value?.setAttribute("lang", lang);
				else timeRef.value?.removeAttribute("lang");
			});
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<p${ssrRenderAttrs(mergeProps({ class: "VPLastUpdated" }, _attrs))} data-v-ec392945>${ssrInterpolate(unref(theme).lastUpdated?.text || "Last updated")}: <time${ssrRenderAttr("datetime", isoDatetime.value)} data-v-ec392945>${ssrInterpolate(datetime.value)}</time></p>`);
		};
	}
};
var _sfc_setup$65 = _sfc_main$65.setup;
_sfc_main$65.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue");
	return _sfc_setup$65 ? _sfc_setup$65(props, ctx) : void 0;
};
var VPDocFooterLastUpdated_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$65, [["__scopeId", "data-v-ec392945"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPLink.vue
var _sfc_main$64 = {
	__name: "VPLink",
	__ssrInlineRender: true,
	props: {
		tag: {
			type: String,
			required: false
		},
		href: {
			type: String,
			required: false
		},
		noIcon: {
			type: Boolean,
			required: false
		},
		external: {
			type: Boolean,
			required: false,
			default: void 0
		},
		target: {
			type: String,
			required: false
		},
		rel: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const tag = computed(() => props.tag ?? (props.href ? "a" : "span"));
		const isExternal = computed(() => isLinkExternal(props.href, props.target, props.external));
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(tag.value), mergeProps({
				class: ["VPLink", {
					link: __props.href,
					"vp-external-link-icon": isExternal.value,
					"no-icon": __props.noIcon
				}],
				href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
				target: __props.target ?? (isExternal.value ? "_blank" : void 0),
				rel: __props.rel ?? (isExternal.value ? "noreferrer" : void 0)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}), _parent);
		};
	}
};
var _sfc_setup$64 = _sfc_main$64.setup;
_sfc_main$64.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPLink.vue");
	return _sfc_setup$64 ? _sfc_setup$64(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue
var _sfc_main$63 = {
	__name: "VPDocFooter",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, page, frontmatter } = useData();
		const editLink = useEditLink();
		const control = usePrevNext();
		const hasEditLink = computed(() => theme.value.editLink && frontmatter.value.editLink !== false);
		const hasLastUpdated = computed(() => page.value.lastUpdated);
		const showFooter = computed(() => hasEditLink.value || hasLastUpdated.value || control.value.prev || control.value.next);
		return (_ctx, _push, _parent, _attrs) => {
			if (showFooter.value) {
				_push(`<footer${ssrRenderAttrs(mergeProps({ class: "VPDocFooter" }, _attrs))} data-v-7b49853b>`);
				ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent);
				if (hasEditLink.value || hasLastUpdated.value) {
					_push(`<div class="edit-info" data-v-7b49853b>`);
					if (hasEditLink.value) {
						_push(`<div class="edit-link" data-v-7b49853b>`);
						_push(ssrRenderComponent(_sfc_main$64, {
							class: "edit-link-button",
							href: unref(editLink).url,
							"no-icon": true
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<span class="vpi-square-pen edit-link-icon" data-v-7b49853b${_scopeId}></span> ${ssrInterpolate(unref(editLink).text)}`);
								else return [createVNode("span", { class: "vpi-square-pen edit-link-icon" }), createTextVNode(" " + toDisplayString(unref(editLink).text), 1)];
							}),
							_: 1
						}, _parent));
						_push(`</div>`);
					} else _push(`<!---->`);
					if (hasLastUpdated.value) {
						_push(`<div class="last-updated" data-v-7b49853b>`);
						_push(ssrRenderComponent(VPDocFooterLastUpdated_default, null, null, _parent));
						_push(`</div>`);
					} else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				if (unref(control).prev?.link || unref(control).next?.link) {
					_push(`<nav class="prev-next" aria-labelledby="doc-footer-aria-label" data-v-7b49853b><span class="visually-hidden" id="doc-footer-aria-label" data-v-7b49853b>Pager</span><div class="pager" data-v-7b49853b>`);
					if (unref(control).prev?.link) _push(ssrRenderComponent(_sfc_main$64, {
						class: "pager-link prev",
						href: unref(control).prev.link,
						target: unref(control).prev.target,
						rel: unref(control).prev.rel
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`<span class="desc" data-v-7b49853b${_scopeId}>${(unref(theme).docFooter?.prev || "Previous page") ?? ""}</span><span class="title" data-v-7b49853b${_scopeId}>${unref(control).prev.text ?? ""}</span>`);
							else return [createVNode("span", {
								class: "desc",
								innerHTML: unref(theme).docFooter?.prev || "Previous page"
							}, null, 8, ["innerHTML"]), createVNode("span", {
								class: "title",
								innerHTML: unref(control).prev.text
							}, null, 8, ["innerHTML"])];
						}),
						_: 1
					}, _parent));
					else _push(`<!---->`);
					_push(`</div><div class="pager" data-v-7b49853b>`);
					if (unref(control).next?.link) _push(ssrRenderComponent(_sfc_main$64, {
						class: "pager-link next",
						href: unref(control).next.link,
						target: unref(control).next.target,
						rel: unref(control).next.rel
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`<span class="desc" data-v-7b49853b${_scopeId}>${(unref(theme).docFooter?.next || "Next page") ?? ""}</span><span class="title" data-v-7b49853b${_scopeId}>${unref(control).next.text ?? ""}</span>`);
							else return [createVNode("span", {
								class: "desc",
								innerHTML: unref(theme).docFooter?.next || "Next page"
							}, null, 8, ["innerHTML"]), createVNode("span", {
								class: "title",
								innerHTML: unref(control).next.text
							}, null, 8, ["innerHTML"])];
						}),
						_: 1
					}, _parent));
					else _push(`<!---->`);
					_push(`</div></nav>`);
				} else _push(`<!---->`);
				_push(`</footer>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$63 = _sfc_main$63.setup;
_sfc_main$63.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue");
	return _sfc_setup$63 ? _sfc_setup$63(props, ctx) : void 0;
};
var VPDocFooter_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$63, [["__scopeId", "data-v-7b49853b"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue
var _sfc_main$62 = {
	__name: "VPDoc",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, site } = useData();
		const route = useRoute();
		const { hasSidebar, hasAside, leftAside } = useLayout();
		const pageName = computed(() => {
			return (isRelativeBase(site.value.base) ? "/" + route.path.slice(runtimeBase().length) : route.path).replace(/[./]+/g, "_").replace(/_html$/, "");
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPDoc", {
				"has-sidebar": unref(hasSidebar),
				"has-aside": unref(hasAside)
			}] }, _attrs))} data-v-8ba3d45b>`);
			ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent);
			_push(`<div class="container" data-v-8ba3d45b>`);
			if (unref(hasAside)) {
				_push(`<div class="${ssrRenderClass([{ "left-aside": unref(leftAside) }, "aside"])}" data-v-8ba3d45b><div class="aside-curtain" data-v-8ba3d45b></div><div class="aside-container" data-v-8ba3d45b><div class="aside-content" data-v-8ba3d45b>`);
				_push(ssrRenderComponent(VPDocAside_default, null, {
					"aside-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
					}),
					"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
					}),
					"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
					}),
					"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
					}),
					"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
					}),
					"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(`</div></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="content" data-v-8ba3d45b><div class="content-container" data-v-8ba3d45b>`);
			ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent);
			_push(`<main class="main" data-v-8ba3d45b>`);
			_push(ssrRenderComponent(_component_Content, { class: ["vp-doc", [pageName.value, unref(theme).externalLinkIcon && "external-link-icon-enabled"]] }, null, _parent));
			_push(`</main>`);
			_push(ssrRenderComponent(VPDocFooter_default, null, {
				"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent);
			_push(`</div></div></div>`);
			ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$62 = _sfc_main$62.setup;
_sfc_main$62.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue");
	return _sfc_setup$62 ? _sfc_setup$62(props, ctx) : void 0;
};
var VPDoc_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$62, [["__scopeId", "data-v-8ba3d45b"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue
var _sfc_main$61 = {};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPHomeContent vp-doc container" }, _attrs))} data-v-d438e14a>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$61 = _sfc_main$61.setup;
_sfc_main$61.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue");
	return _sfc_setup$61 ? _sfc_setup$61(props, ctx) : void 0;
};
var VPHomeContent_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$61, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-d438e14a"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPImage.vue
var _sfc_main$60 = /*@__PURE__*/ Object.assign({ inheritAttrs: false }, {
	__name: "VPImage",
	__ssrInlineRender: true,
	props: {
		image: {
			type: [String, Object],
			required: true
		},
		alt: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPImage = resolveComponent("VPImage", true);
			if (__props.image) {
				_push(`<!--[-->`);
				if (typeof __props.image === "string" || "src" in __props.image) _push(`<img${ssrRenderAttrs(mergeProps({ class: "VPImage" }, typeof __props.image === "string" ? _ctx.$attrs : {
					...__props.image,
					..._ctx.$attrs
				}, {
					src: unref(withBase)(typeof __props.image === "string" ? __props.image : __props.image.src),
					alt: __props.alt ?? (typeof __props.image === "string" ? "" : __props.image.alt || "")
				}))} data-v-b7995f32>`);
				else {
					_push(`<!--[-->`);
					_push(ssrRenderComponent(_component_VPImage, mergeProps({
						class: "dark",
						image: __props.image.dark,
						alt: __props.image.alt
					}, _ctx.$attrs), null, _parent));
					_push(ssrRenderComponent(_component_VPImage, mergeProps({
						class: "light",
						image: __props.image.light,
						alt: __props.image.alt
					}, _ctx.$attrs), null, _parent));
					_push(`<!--]-->`);
				}
				_push(`<!--]-->`);
			} else _push(`<!---->`);
		};
	}
});
var _sfc_setup$60 = _sfc_main$60.setup;
_sfc_main$60.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPImage.vue");
	return _sfc_setup$60 ? _sfc_setup$60(props, ctx) : void 0;
};
var VPImage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$60, [["__scopeId", "data-v-b7995f32"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue
var _sfc_main$59 = {
	__name: "VPFeature",
	__ssrInlineRender: true,
	props: {
		icon: {
			type: [String, Object],
			required: false
		},
		title: {
			type: String,
			required: true
		},
		details: {
			type: String,
			required: false
		},
		link: {
			type: String,
			required: false
		},
		linkText: {
			type: String,
			required: false
		},
		rel: {
			type: String,
			required: false
		},
		target: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$64, mergeProps({
				class: "VPFeature",
				href: __props.link,
				rel: __props.rel,
				target: __props.target,
				"no-icon": true,
				tag: __props.link ? "a" : "div"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<article class="box" data-v-aba599ce${_scopeId}>`);
						if (typeof __props.icon === "object" && __props.icon.wrap) {
							_push(`<div class="icon" data-v-aba599ce${_scopeId}>`);
							_push(ssrRenderComponent(VPImage_default, {
								image: __props.icon,
								alt: __props.icon.alt,
								height: __props.icon.height || 48,
								width: __props.icon.width || 48
							}, null, _parent, _scopeId));
							_push(`</div>`);
						} else if (typeof __props.icon === "object") _push(ssrRenderComponent(VPImage_default, {
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, _parent, _scopeId));
						else if (__props.icon) _push(`<div class="icon" data-v-aba599ce${_scopeId}>${__props.icon ?? ""}</div>`);
						else _push(`<!---->`);
						_push(`<h2 class="title" data-v-aba599ce${_scopeId}>${__props.title ?? ""}</h2>`);
						if (Array.isArray(__props.details)) {
							_push(`<ul class="details" data-v-aba599ce${_scopeId}><!--[-->`);
							ssrRenderList(__props.details, (item) => {
								_push(`<li data-v-aba599ce${_scopeId}>${item ?? ""}</li>`);
							});
							_push(`<!--]--></ul>`);
						} else if (__props.details) _push(`<p class="details" data-v-aba599ce${_scopeId}>${__props.details ?? ""}</p>`);
						else _push(`<!---->`);
						if (__props.linkText) _push(`<div class="link-text" data-v-aba599ce${_scopeId}><p class="link-text-value" data-v-aba599ce${_scopeId}>${ssrInterpolate(__props.linkText)} <span class="vpi-arrow-right link-text-icon" data-v-aba599ce${_scopeId}></span></p></div>`);
						else _push(`<!---->`);
						_push(`</article>`);
					} else return [createVNode("article", { class: "box" }, [
						typeof __props.icon === "object" && __props.icon.wrap ? (openBlock(), createBlock("div", {
							key: 0,
							class: "icon"
						}, [createVNode(VPImage_default, {
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, 8, [
							"image",
							"alt",
							"height",
							"width"
						])])) : typeof __props.icon === "object" ? (openBlock(), createBlock(VPImage_default, {
							key: 1,
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, 8, [
							"image",
							"alt",
							"height",
							"width"
						])) : __props.icon ? (openBlock(), createBlock("div", {
							key: 2,
							class: "icon",
							innerHTML: __props.icon
						}, null, 8, ["innerHTML"])) : createCommentVNode("", true),
						createVNode("h2", {
							class: "title",
							innerHTML: __props.title
						}, null, 8, ["innerHTML"]),
						Array.isArray(__props.details) ? (openBlock(), createBlock("ul", {
							key: 3,
							class: "details"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.details, (item) => {
							return openBlock(), createBlock("li", {
								key: item,
								innerHTML: item
							}, null, 8, ["innerHTML"]);
						}), 128))])) : __props.details ? (openBlock(), createBlock("p", {
							key: 4,
							class: "details",
							innerHTML: __props.details
						}, null, 8, ["innerHTML"])) : createCommentVNode("", true),
						__props.linkText ? (openBlock(), createBlock("div", {
							key: 5,
							class: "link-text"
						}, [createVNode("p", { class: "link-text-value" }, [createTextVNode(toDisplayString(__props.linkText) + " ", 1), createVNode("span", { class: "vpi-arrow-right link-text-icon" })])])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$59 = _sfc_main$59.setup;
_sfc_main$59.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue");
	return _sfc_setup$59 ? _sfc_setup$59(props, ctx) : void 0;
};
var VPFeature_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$59, [["__scopeId", "data-v-aba599ce"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue
var _sfc_main$58 = {
	__name: "VPFeatures",
	__ssrInlineRender: true,
	props: { features: {
		type: Array,
		required: true
	} },
	setup(__props) {
		const props = __props;
		const grid = computed(() => {
			const length = props.features.length;
			if (!length) return;
			else if (length === 2) return "grid-2";
			else if (length === 3) return "grid-3";
			else if (length % 3 === 0) return "grid-6";
			else if (length > 3) return "grid-4";
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.features) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPFeatures" }, _attrs))} data-v-702930b9><div class="container" data-v-702930b9><ul class="items" data-v-702930b9><!--[-->`);
				ssrRenderList(__props.features, (feature) => {
					_push(`<li class="${ssrRenderClass([[grid.value], "item"])}" data-v-702930b9>`);
					_push(ssrRenderComponent(VPFeature_default, {
						icon: feature.icon,
						title: feature.title,
						details: feature.details,
						link: feature.link,
						"link-text": feature.linkText,
						rel: feature.rel,
						target: feature.target
					}, null, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul></div></div>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$58 = _sfc_main$58.setup;
_sfc_main$58.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue");
	return _sfc_setup$58 ? _sfc_setup$58(props, ctx) : void 0;
};
var VPFeatures_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$58, [["__scopeId", "data-v-702930b9"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue
var _sfc_main$57 = {
	__name: "VPHomeFeatures",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter: fm } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(fm).features) _push(ssrRenderComponent(VPFeatures_default, mergeProps({
				class: "VPHomeFeatures",
				features: unref(fm).features
			}, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$57 = _sfc_main$57.setup;
_sfc_main$57.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue");
	return _sfc_setup$57 ? _sfc_setup$57(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPButton.vue
var _sfc_main$56 = {
	__name: "VPButton",
	__ssrInlineRender: true,
	props: {
		tag: {
			type: String,
			required: false
		},
		size: {
			type: String,
			required: false,
			default: "medium"
		},
		theme: {
			type: String,
			required: false,
			default: "brand"
		},
		text: {
			type: String,
			required: false
		},
		href: {
			type: String,
			required: false
		},
		target: {
			type: String,
			required: false
		},
		rel: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const isExternal = computed(() => props.href && EXTERNAL_URL_RE.test(props.href));
		const component = computed(() => {
			return props.tag || (props.href ? "a" : "button");
		});
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(component.value), mergeProps({
				class: ["VPButton no-icon", [__props.size, __props.theme]],
				href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
				target: props.target ?? (isExternal.value ? "_blank" : void 0),
				rel: props.rel ?? (isExternal.value ? "noreferrer" : void 0)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, () => {
						_push(`${ssrInterpolate(__props.text)}`);
					}, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(__props.text), 1)], true)];
				}),
				_: 3
			}), _parent);
		};
	}
};
var _sfc_setup$56 = _sfc_main$56.setup;
_sfc_main$56.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPButton.vue");
	return _sfc_setup$56 ? _sfc_setup$56(props, ctx) : void 0;
};
var VPButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$56, [["__scopeId", "data-v-5d59b88c"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPHero.vue
var _sfc_main$55 = {
	__name: "VPHero",
	__ssrInlineRender: true,
	props: {
		name: {
			type: String,
			required: false
		},
		text: {
			type: String,
			required: false
		},
		tagline: {
			type: String,
			required: false
		},
		image: {
			type: [String, Object],
			required: false
		},
		actions: {
			type: Array,
			required: false
		}
	},
	setup(__props) {
		const { heroImageSlotExists } = inject(layoutInfoInjectionKey, { heroImageSlotExists: computed(() => false) });
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPHero", { "has-image": __props.image || unref(heroImageSlotExists) }] }, _attrs))} data-v-39c3ef28><div class="container" data-v-39c3ef28><div class="main" data-v-39c3ef28>`);
			ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, () => {
				_push(`<h1 class="heading" data-v-39c3ef28>`);
				if (__props.name) _push(`<span class="name clip" data-v-39c3ef28>${__props.name ?? ""}</span>`);
				else _push(`<!---->`);
				if (__props.text) _push(`<span class="text" data-v-39c3ef28>${__props.text ?? ""}</span>`);
				else _push(`<!---->`);
				_push(`</h1>`);
				if (__props.tagline) _push(`<p class="tagline" data-v-39c3ef28>${__props.tagline ?? ""}</p>`);
				else _push(`<!---->`);
			}, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent);
			if (__props.actions) {
				_push(`<div class="actions" data-v-39c3ef28>`);
				ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent);
				_push(`<!--[-->`);
				ssrRenderList(__props.actions, (action) => {
					_push(`<div class="action" data-v-39c3ef28>`);
					_push(ssrRenderComponent(VPButton_default, {
						tag: "a",
						size: "medium",
						theme: action.theme,
						text: action.text,
						href: action.link,
						target: action.target,
						rel: action.rel
					}, null, _parent));
					_push(`</div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent);
			_push(`</div>`);
			if (__props.image || unref(heroImageSlotExists)) {
				_push(`<div class="image" data-v-39c3ef28><div class="image-container" data-v-39c3ef28><div class="image-bg" data-v-39c3ef28></div>`);
				ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, () => {
					if (__props.image) _push(ssrRenderComponent(VPImage_default, {
						class: "image-src",
						image: __props.image
					}, null, _parent));
					else _push(`<!---->`);
				}, _push, _parent);
				_push(`</div></div>`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
		};
	}
};
var _sfc_setup$55 = _sfc_main$55.setup;
_sfc_main$55.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPHero.vue");
	return _sfc_setup$55 ? _sfc_setup$55(props, ctx) : void 0;
};
var VPHero_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$55, [["__scopeId", "data-v-39c3ef28"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue
var _sfc_main$54 = {
	__name: "VPHomeHero",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter: fm } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(fm).hero) _push(ssrRenderComponent(VPHero_default, mergeProps({
				class: "VPHomeHero",
				name: unref(fm).hero.name,
				text: unref(fm).hero.text,
				tagline: unref(fm).hero.tagline,
				image: unref(fm).hero.image,
				actions: unref(fm).hero.actions
			}, _attrs), {
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before")];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info")];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after")];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after")];
				}),
				"home-hero-actions-before-actions": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-before-actions")];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image")];
				}),
				_: 3
			}, _parent));
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$54 = _sfc_main$54.setup;
_sfc_main$54.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue");
	return _sfc_setup$54 ? _sfc_setup$54(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPHome.vue
var _sfc_main$53 = {
	__name: "VPHome",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter, theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPHome", { "external-link-icon-enabled": unref(theme).externalLinkIcon }] }, _attrs))} data-v-b991a01d>`);
			ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(_sfc_main$54, null, {
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
				}),
				"home-hero-actions-before-actions": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(_sfc_main$57, null, null, _parent));
			ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent);
			if (unref(frontmatter).markdownStyles !== false) _push(ssrRenderComponent(VPHomeContent_default, null, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(_component_Content, null, null, _parent, _scopeId));
					else return [createVNode(_component_Content)];
				}),
				_: 1
			}, _parent));
			else _push(ssrRenderComponent(_component_Content, null, null, _parent));
			_push(`</div>`);
		};
	}
};
var _sfc_setup$53 = _sfc_main$53.setup;
_sfc_main$53.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPHome.vue");
	return _sfc_setup$53 ? _sfc_setup$53(props, ctx) : void 0;
};
var VPHome_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$53, [["__scopeId", "data-v-b991a01d"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPPage.vue
var _sfc_main$52 = {};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs) {
	const _component_Content = resolveComponent("Content");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPPage" }, _attrs))}>`);
	ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent);
	_push(ssrRenderComponent(_component_Content, null, null, _parent));
	ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$52 = _sfc_main$52.setup;
_sfc_main$52.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPPage.vue");
	return _sfc_setup$52 ? _sfc_setup$52(props, ctx) : void 0;
};
var VPPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$52, [["ssrRender", _sfc_ssrRender$2]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPContent.vue
var _sfc_main$51 = {
	__name: "VPContent",
	__ssrInlineRender: true,
	setup(__props) {
		const { page, frontmatter } = useData();
		const { isHome, hasSidebar } = useLayout();
		function isRegistered(component) {
			return typeof resolveDynamicComponent(component) !== "string";
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: ["VPContent", {
					"has-sidebar": unref(hasSidebar),
					"is-home": unref(isHome)
				}],
				id: "VPContent"
			}, _attrs))} data-v-852b6936>`);
			if (unref(page).isNotFound) ssrRenderSlot(_ctx.$slots, "not-found", {}, () => {
				_push(ssrRenderComponent(NotFound_default, null, null, _parent));
			}, _push, _parent);
			else if (unref(frontmatter).layout === "page" && !isRegistered("page")) _push(ssrRenderComponent(VPPage_default, null, {
				"page-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "page-top", {}, void 0, true)];
				}),
				"page-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			else if (unref(frontmatter).layout === "home" && !isRegistered("home")) _push(ssrRenderComponent(VPHome_default, null, {
				"home-hero-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)];
				}),
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
				}),
				"home-hero-actions-before-actions": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
				}),
				"home-hero-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)];
				}),
				"home-features-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)];
				}),
				"home-features-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			else if ((!unref(frontmatter).layout || unref(frontmatter).layout === "doc") && !isRegistered("doc")) _push(ssrRenderComponent(VPDoc_default, null, {
				"doc-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)];
				}),
				"doc-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)];
				}),
				"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
				}),
				"doc-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)];
				}),
				"doc-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)];
				}),
				"aside-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
				}),
				"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
				}),
				"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
				}),
				"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
				}),
				"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
				}),
				"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			else ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(frontmatter).layout || "doc"), null, null), _parent);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$51 = _sfc_main$51.setup;
_sfc_main$51.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPContent.vue");
	return _sfc_setup$51 ? _sfc_setup$51(props, ctx) : void 0;
};
var VPContent_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$51, [["__scopeId", "data-v-852b6936"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue
var _sfc_main$50 = {
	__name: "VPFooter",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, frontmatter } = useData();
		const { hasSidebar } = useLayout();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).footer && unref(frontmatter).footer !== false) {
				_push(`<footer${ssrRenderAttrs(mergeProps({ class: ["VPFooter", { "has-sidebar": unref(hasSidebar) }] }, _attrs))} data-v-dd9e2ea5><div class="container" data-v-dd9e2ea5>`);
				if (unref(theme).footer.message) _push(`<p class="message" data-v-dd9e2ea5>${unref(theme).footer.message ?? ""}</p>`);
				else _push(`<!---->`);
				if (unref(theme).footer.copyright) _push(`<p class="copyright" data-v-dd9e2ea5>${unref(theme).footer.copyright ?? ""}</p>`);
				else _push(`<!---->`);
				_push(`</div></footer>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$50 = _sfc_main$50.setup;
_sfc_main$50.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue");
	return _sfc_setup$50 ? _sfc_setup$50(props, ctx) : void 0;
};
var VPFooter_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$50, [["__scopeId", "data-v-dd9e2ea5"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/scroll-lock.js
var isIOS = inBrowser && (/iP(?:ad|hone|od)/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
var scrollKeys = /* @__PURE__ */ new Set([
	" ",
	"PageUp",
	"PageDown",
	"Home",
	"End",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
var listenerOptions = {
	capture: true,
	passive: false
};
function isScrollable(target) {
	let el = target instanceof Element ? target : null;
	while (el && el !== document.body) {
		const { overflowX, overflowY } = getComputedStyle(el);
		if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight || (overflowX === "auto" || overflowX === "scroll") && el.scrollWidth > el.clientWidth) return true;
		el = el.parentElement;
	}
	return false;
}
function blockScroll(e) {
	if ("touches" in e && e.touches.length > 1) return;
	if (!isScrollable(e.target)) e.preventDefault();
}
function blockScrollKeys(e) {
	if (e.metaKey || e.ctrlKey || e.altKey || !scrollKeys.has(e.key)) return;
	const el = e.target;
	if (el instanceof HTMLElement && (el.isContentEditable || el.matches("input, textarea, select"))) return;
	blockScroll(e);
}
var overflowLockCount = 0;
var eventLockCount = 0;
var initialOverflow;
var initialGutter;
function lockOverflow() {
	if (++overflowLockCount > 1) return;
	const html = document.documentElement;
	if (!getComputedStyle(html).scrollbarGutter.includes("stable")) {
		initialGutter = html.style.scrollbarGutter;
		html.style.scrollbarGutter = "stable";
	}
	initialOverflow = document.body.style.overflow;
	document.body.style.overflow = "hidden";
	if (isIOS) document.addEventListener("touchmove", blockScroll, listenerOptions);
}
function unlockOverflow() {
	if (--overflowLockCount > 0) return;
	if (isIOS) document.removeEventListener("touchmove", blockScroll, listenerOptions);
	document.body.style.overflow = initialOverflow ?? "";
	if (initialGutter !== void 0) document.documentElement.style.scrollbarGutter = initialGutter;
	initialOverflow = initialGutter = void 0;
}
function lockEvents() {
	if (++eventLockCount > 1) return;
	document.addEventListener("wheel", blockScroll, listenerOptions);
	document.addEventListener("touchmove", blockScroll, listenerOptions);
	document.addEventListener("keydown", blockScrollKeys, listenerOptions);
}
function unlockEvents() {
	if (--eventLockCount > 0) return;
	document.removeEventListener("wheel", blockScroll, listenerOptions);
	document.removeEventListener("touchmove", blockScroll, listenerOptions);
	document.removeEventListener("keydown", blockScrollKeys, listenerOptions);
}
/**
* Locks page scrolling behind an overlay.
*
* Prefer `scrollbar-gutter: stable` + `overflow: hidden` so layout width
* stays stable when the scrollbar is hidden. If unsupported, fall back to
* blocking scroll events while still allowing events inside scrollable
* elements.
*/
function useBodyScrollLock() {
	const isLocked = shallowRef(false);
	let useEvents = false;
	function lock() {
		if (isLocked.value) return;
		useEvents = window.innerWidth > document.documentElement.clientWidth && !CSS.supports("scrollbar-gutter", "stable");
		useEvents ? lockEvents() : lockOverflow();
		isLocked.value = true;
	}
	function unlock() {
		if (!isLocked.value) return;
		useEvents ? unlockEvents() : unlockOverflow();
		isLocked.value = false;
	}
	onScopeDispose(unlock);
	return computed({
		get: () => isLocked.value,
		set: (value) => value ? lock() : unlock()
	});
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue
var _sfc_main$49 = {
	__name: "VPLocalNavOutlineDropdown",
	__ssrInlineRender: true,
	props: {
		headers: {
			type: Array,
			required: true
		},
		navHeight: {
			type: Number,
			required: true
		}
	},
	setup(__props) {
		const { theme } = useData();
		const open = ref(false);
		const vh = ref(0);
		const main = useTemplateRef("main");
		useTemplateRef("items");
		const itemsId = useId();
		const isLocked = useBodyScrollLock();
		function closeOnClickOutside(e) {
			if (!main.value?.contains(e.target)) open.value = false;
		}
		watch(open, (value) => {
			isLocked.value = value;
			if (value) {
				document.addEventListener("click", closeOnClickOutside);
				return;
			}
			document.removeEventListener("click", closeOnClickOutside);
		});
		onKeyStroke("Escape", () => {
			open.value = false;
		});
		onContentUpdated(() => {
			open.value = false;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				ref_key: "main",
				ref: main,
				class: "VPLocalNavOutlineDropdown",
				style: { "--vp-vh": vh.value + "px" },
				"data-allow-mismatch": "style"
			}, _attrs))} data-v-a9770819>`);
			if (__props.headers.length > 0) _push(`<button type="button"${ssrRenderAttr("aria-expanded", open.value)}${ssrRenderAttr("aria-controls", unref(itemsId))} class="${ssrRenderClass({ open: open.value })}" data-v-a9770819><span class="menu-text" data-v-a9770819>${ssrInterpolate(unref(resolveTitle)(unref(theme)))}</span><span class="vpi-chevron-right icon" aria-hidden="true" data-v-a9770819></span></button>`);
			else _push(`<button type="button" data-v-a9770819>${ssrInterpolate(unref(theme).returnToTopLabel || "Return to top")}</button>`);
			if (open.value) {
				_push(`<div${ssrRenderAttr("id", unref(itemsId))} class="items" data-v-a9770819><div class="header" data-v-a9770819><a class="top-link" href="#" data-v-a9770819>${ssrInterpolate(unref(theme).returnToTopLabel || "Return to top")}</a></div><div class="outline" data-v-a9770819>`);
				_push(ssrRenderComponent(VPDocOutlineItem_default, { headers: __props.headers }, null, _parent));
				_push(`</div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$49 = _sfc_main$49.setup;
_sfc_main$49.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue");
	return _sfc_setup$49 ? _sfc_setup$49(props, ctx) : void 0;
};
var VPLocalNavOutlineDropdown_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$49, [["__scopeId", "data-v-a9770819"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue
var _sfc_main$48 = {
	__name: "VPLocalNav",
	__ssrInlineRender: true,
	props: { open: {
		type: Boolean,
		required: true
	} },
	emits: ["open-menu"],
	setup(__props) {
		const { theme } = useData();
		const { isHome, hasSidebar, headers, hasLocalNav } = useLayout();
		const { y } = useWindowScroll();
		const navHeight = ref(0);
		onMounted(() => {
			const probe = document.createElement("div");
			probe.style.cssText = "position: absolute; visibility: hidden; height: var(--vp-nav-height)";
			document.body.appendChild(probe);
			navHeight.value = probe.offsetHeight;
			probe.remove();
		});
		const isScrolled = computed(() => y.value >= navHeight.value);
		return (_ctx, _push, _parent, _attrs) => {
			if (!unref(isHome) && (unref(hasLocalNav) || unref(hasSidebar) || isScrolled.value)) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPLocalNav", {
					"has-sidebar": unref(hasSidebar),
					"empty": !unref(hasLocalNav),
					"fixed": !unref(hasLocalNav) && !unref(hasSidebar)
				}] }, _attrs))} data-v-19dde0b7><div class="container" data-v-19dde0b7>`);
				if (unref(hasSidebar)) _push(`<button type="button" class="menu"${ssrRenderAttr("aria-expanded", __props.open)} aria-controls="VPSidebarNav" data-v-19dde0b7><span class="vpi-align-left menu-icon" aria-hidden="true" data-v-19dde0b7></span><span class="menu-text" data-v-19dde0b7>${ssrInterpolate(unref(theme).sidebarMenuLabel || "Menu")}</span></button>`);
				else _push(`<!---->`);
				_push(ssrRenderComponent(VPLocalNavOutlineDropdown_default, {
					headers: unref(headers),
					navHeight: navHeight.value
				}, null, _parent));
				_push(`</div></div>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$48 = _sfc_main$48.setup;
_sfc_main$48.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue");
	return _sfc_setup$48 ? _sfc_setup$48(props, ctx) : void 0;
};
var VPLocalNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$48, [["__scopeId", "data-v-19dde0b7"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/nav.js
var isScreenOpen = ref(false);
var screenTriggerEl = shallowRef(null);
function openScreen() {
	isScreenOpen.value = true;
}
function closeScreen() {
	isScreenOpen.value = false;
}
function toggleScreen() {
	isScreenOpen.value ? closeScreen() : openScreen();
}
var watchersRegistered = false;
function useNav() {
	if (inBrowser && !watchersRegistered) {
		watchersRegistered = true;
		const isTablet = useMediaQuery("(min-width: 48rem)");
		whenever(isTablet, closeScreen);
		const route = useRoute();
		watch(() => route.path, closeScreen);
	}
	return {
		isScreenOpen,
		screenTriggerEl,
		openScreen,
		closeScreen,
		toggleScreen
	};
}
function useAppearanceSwitch() {
	const { site } = useData();
	return computed(() => !!site.value.appearance && site.value.appearance !== "force-dark" && site.value.appearance !== "force-auto");
}
function useNavItemLink(item) {
	const route = useRoute();
	const href = computed(() => {
		const { link } = toValue(item);
		return typeof link === "function" ? link(route.data) : link;
	});
	return {
		href,
		isActiveLink: computed(() => {
			const { activeMatch } = toValue(item);
			return isActive(route.data.relativePath, route.hash, activeMatch || href.value, !!activeMatch);
		}),
		isCurrentLink: computed(() => {
			return isActive(route.data.relativePath, route.hash, href.value);
		})
	};
}
var navInjectionKey = Symbol("nav");
var navScreenInjectionKey = Symbol("nav-screen");
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/nav-overflow.js
/**
* Priority+ overflow for the navbar (#1271, #2842).
*
* Collapse order under space pressure: social links → appearance switch →
* translations → menu items right-to-left. Collapsed units move into the
* `⋯` flyout (VPNavBarExtra) instead of being clipped, so nothing ever
* becomes unreachable.
*
* Collapsed units stay mounted but hidden (visibility: hidden + absolute,
* which also removes them from the a11y tree and tab order), so their
* natural widths remain measurable and observed — re-expanding never works
* from stale data.
*/
var navClusterUnits = [
	"translations",
	"appearance",
	"socialLinks"
];
var allVisible = {
	visibleItemCount: Infinity,
	translations: true,
	appearance: true,
	socialLinks: true
};
function computeNavFit(input) {
	const { itemWidths, available, extraWidth } = input;
	const itemsTotal = itemWidths.reduce((sum, w) => sum + w, 0);
	if (itemsTotal + ((input.translations ?? 0) + (input.appearance ?? 0) + (input.socialLinks ?? 0)) <= available) return allVisible;
	const budget = available - extraWidth;
	if (itemsTotal > budget) {
		let used = 0;
		let visibleItemCount = 0;
		for (const width of itemWidths) {
			if (used + width > budget) break;
			used += width;
			visibleItemCount++;
		}
		return {
			visibleItemCount,
			translations: input.translations == null,
			appearance: input.appearance == null,
			socialLinks: input.socialLinks == null
		};
	}
	const result = { ...allVisible };
	let used = itemsTotal;
	let dropRest = false;
	for (const unit of navClusterUnits) {
		const width = input[unit];
		if (width == null) continue;
		if (dropRest || used + width > budget) {
			dropRest = true;
			result[unit] = false;
		} else used += width;
	}
	return result;
}
/** headroom against sub-pixel rounding and the inter-unit dividers */
var SLACK = 24;
/** used until the real `⋯` button has been measured once */
var EXTRA_WIDTH_ESTIMATE = 48;
var navOverflowKey = Symbol("nav-overflow");
function useNavOverflow() {
	return inject(navOverflowKey, null);
}
function provideNavOverflow(options) {
	const state = reactive({ ...allVisible });
	const itemEls = /* @__PURE__ */ new Map();
	const clusterEls = /* @__PURE__ */ new Map();
	let containerEl = null;
	let menuEl = null;
	let extraEl = null;
	let extraWidth = EXTRA_WIDTH_ESTIMATE;
	let observer = null;
	const observed = /* @__PURE__ */ new Set();
	let scheduled = false;
	function observe(el) {
		if (!inBrowser || !(el instanceof Element) || observed.has(el)) return;
		observed.add(el);
		(observer ??= new ResizeObserver(schedule)).observe(el);
	}
	function schedule() {
		if (!inBrowser || scheduled) return;
		scheduled = true;
		requestAnimationFrame(() => {
			scheduled = false;
			recompute();
		});
	}
	const controller = {
		state,
		hasCollapsed: () => state.visibleItemCount !== Infinity || !state.translations || !state.appearance || !state.socialLinks,
		setContainerEl(el) {
			containerEl = el;
			observe(el);
			schedule();
		},
		setMenuEl(el) {
			menuEl = el;
			observe(el);
			schedule();
		},
		setExtraEl(el) {
			extraEl = el;
			observe(el);
			schedule();
		},
		setItemEl(index, el) {
			el ? itemEls.set(index, el) : itemEls.delete(index);
			observe(el);
			schedule();
		},
		setClusterEl(unit, el) {
			el ? clusterEls.set(unit, el) : clusterEls.delete(unit);
			observe(el);
			schedule();
		}
	};
	provide(navOverflowKey, controller);
	if (!inBrowser) return controller;
	const isEngineActive = useMediaQuery("(min-width: 48rem)");
	function measureUnit(el) {
		return Math.max(el.offsetWidth, el.scrollWidth);
	}
	function recompute() {
		if (!isEngineActive.value) return applyResult(allVisible);
		if (!containerEl) return;
		if (extraEl && extraEl.offsetWidth > 0) extraWidth = extraEl.offsetWidth;
		let fixed = 0;
		for (const child of Array.from(containerEl.children)) {
			if (!(child instanceof HTMLElement)) continue;
			if (child === menuEl || child === extraEl) continue;
			let isCluster = false;
			for (const el of clusterEls.values()) if (el === child) {
				isCluster = true;
				break;
			}
			if (isCluster) continue;
			fixed += child.offsetWidth;
		}
		const itemWidths = [];
		for (let i = 0; i < itemEls.size; i++) {
			const el = itemEls.get(i);
			if (!el) return;
			itemWidths.push(measureUnit(el));
		}
		const clusterWidth = (unit) => {
			const el = clusterEls.get(unit);
			return el ? measureUnit(el) : null;
		};
		applyResult(computeNavFit({
			itemWidths,
			translations: clusterWidth("translations"),
			appearance: clusterWidth("appearance"),
			socialLinks: clusterWidth("socialLinks"),
			available: containerEl.clientWidth - fixed - SLACK,
			extraWidth
		}));
	}
	function applyResult(result) {
		if (state.visibleItemCount !== result.visibleItemCount) state.visibleItemCount = result.visibleItemCount;
		for (const unit of navClusterUnits) if (state[unit] !== result[unit]) state[unit] = result[unit];
	}
	watch(isEngineActive, schedule);
	watch(() => toValue(options.itemsKey), schedule);
	if (document.fonts?.ready) document.fonts.ready.then(schedule).catch(() => {});
	onScopeDispose(() => {
		observer?.disconnect();
		observer = null;
		observed.clear();
	});
	return controller;
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSwitch.vue
var _sfc_main$47 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
	_push(`<button${ssrRenderAttrs(mergeProps({
		class: "VPSwitch",
		type: "button",
		role: "switch"
	}, _attrs))} data-v-a2ada4fc><span class="check" data-v-a2ada4fc>`);
	if (_ctx.$slots.default) {
		_push(`<span class="icon" data-v-a2ada4fc>`);
		ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
		_push(`</span>`);
	} else _push(`<!---->`);
	_push(`</span></button>`);
}
var _sfc_setup$47 = _sfc_main$47.setup;
_sfc_main$47.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSwitch.vue");
	return _sfc_setup$47 ? _sfc_setup$47(props, ctx) : void 0;
};
var VPSwitch_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$47, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-a2ada4fc"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue
var _sfc_main$46 = {
	__name: "VPSwitchAppearance",
	__ssrInlineRender: true,
	setup(__props) {
		const { isDark, theme } = useData();
		const toggleAppearance = inject("toggle-appearance", () => {
			isDark.value = !isDark.value;
		});
		const switchTitle = ref("");
		watchPostEffect(() => {
			switchTitle.value = isDark.value ? theme.value.lightModeSwitchTitle || "Switch to light theme" : theme.value.darkModeSwitchTitle || "Switch to dark theme";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPSwitch_default, mergeProps({
				title: switchTitle.value,
				class: "VPSwitchAppearance",
				"aria-label": unref(theme).darkModeSwitchLabel || "Appearance",
				"aria-checked": unref(isDark),
				onClick: unref(toggleAppearance)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="vpi-sun sun" aria-hidden="true" data-v-2d2da833${_scopeId}></span><span class="vpi-moon moon" aria-hidden="true" data-v-2d2da833${_scopeId}></span>`);
					else return [createVNode("span", {
						class: "vpi-sun sun",
						"aria-hidden": "true"
					}), createVNode("span", {
						class: "vpi-moon moon",
						"aria-hidden": "true"
					})];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$46 = _sfc_main$46.setup;
_sfc_main$46.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue");
	return _sfc_setup$46 ? _sfc_setup$46(props, ctx) : void 0;
};
var VPSwitchAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$46, [["__scopeId", "data-v-2d2da833"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavAppearance.vue
var _sfc_main$45 = {
	__name: "VPNavAppearance",
	__ssrInlineRender: true,
	props: {
		row: {
			type: Boolean,
			required: false
		},
		screen: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const show = useAppearanceSwitch();
		const overflow = props.row ? null : useNavOverflow();
		const isCollapsed = computed(() => !!overflow && !overflow.state.appearance);
		const labelId = useId();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(show)) {
				_push(`<div${ssrRenderAttrs(mergeProps({
					class: ["VPNavAppearance", [__props.row ? __props.screen ? "VPNavScreenAppearance" : "menu-appearance" : "VPNavBarAppearance", { collapsed: isCollapsed.value }]],
					ref: (el) => unref(overflow)?.setClusterEl("appearance", el)
				}, _attrs))} data-v-0526efd6>`);
				if (__props.row) _push(`<p${ssrRenderAttr("id", unref(labelId))} class="text" data-v-0526efd6>${ssrInterpolate(unref(theme).darkModeSwitchLabel || "Appearance")}</p>`);
				else _push(`<!---->`);
				_push(ssrRenderComponent(VPSwitchAppearance_default, { "aria-labelledby": __props.row ? unref(labelId) : void 0 }, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$45 = _sfc_main$45.setup;
_sfc_main$45.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavAppearance.vue");
	return _sfc_setup$45 ? _sfc_setup$45(props, ctx) : void 0;
};
var VPNavAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$45, [["__scopeId", "data-v-0526efd6"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/flyout.js
var focusedElement = ref();
var active = false;
var listeners = 0;
function useFlyout(options) {
	const focus = ref(false);
	if (inBrowser) {
		!active && activateFocusTracking();
		listeners++;
		const unwatch = watch(focusedElement, (el) => {
			if (el === options.el.value || options.el.value?.contains(el)) {
				focus.value = true;
				options.onFocus?.();
			} else {
				focus.value = false;
				options.onBlur?.();
			}
		});
		onUnmounted(() => {
			unwatch();
			listeners--;
			if (!listeners) deactivateFocusTracking();
		});
	}
	return readonly(focus);
}
function activateFocusTracking() {
	document.addEventListener("focusin", handleFocusIn);
	active = true;
	focusedElement.value = document.activeElement;
}
function deactivateFocusTracking() {
	document.removeEventListener("focusin", handleFocusIn);
	active = false;
}
function handleFocusIn() {
	focusedElement.value = document.activeElement;
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue
var _sfc_main$44 = /*@__PURE__*/ Object.assign({ inheritAttrs: false }, {
	__name: "VPMenuLink",
	__ssrInlineRender: true,
	props: {
		item: {
			type: null,
			required: true
		},
		rel: {
			type: String,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const { href, isActiveLink, isCurrentLink } = useNavItemLink(() => props.item);
		const screen = inject(navScreenInjectionKey, false);
		const nav = inject(navInjectionKey, null);
		function onClick() {
			if (screen) nav?.closeScreen();
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<li${ssrRenderAttrs(mergeProps({ class: "VPMenuLink" }, _attrs))} data-v-ef274441>`);
			_push(ssrRenderComponent(_sfc_main$64, mergeProps(_ctx.$attrs, {
				class: {
					active: unref(isActiveLink),
					VPNavScreenMenuGroupLink: unref(screen)
				},
				"aria-current": unref(isCurrentLink) ? "page" : void 0,
				href: unref(href),
				target: __props.item.target,
				rel: props.rel ?? __props.item.rel,
				"no-icon": __props.item.noIcon,
				onClick
			}), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-ef274441${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
			_push(`</li>`);
		};
	}
});
var _sfc_setup$44 = _sfc_main$44.setup;
_sfc_main$44.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue");
	return _sfc_setup$44 ? _sfc_setup$44(props, ctx) : void 0;
};
var VPMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$44, [["__scopeId", "data-v-ef274441"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue
var _sfc_main$43 = {
	__name: "VPMenuGroup",
	__ssrInlineRender: true,
	props: {
		text: {
			type: String,
			required: false
		},
		items: {
			type: Array,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const screen = inject(navScreenInjectionKey, false);
		const hasSubGroups = computed(() => props.items.some((item) => !("link" in item) && !("component" in item)));
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPMenuGroup = resolveComponent("VPMenuGroup", true);
			_push(`<li${ssrRenderAttrs(mergeProps({ class: ["VPMenuGroup", { VPNavScreenMenuGroupSection: unref(screen) }] }, _attrs))} data-v-a581e1a7>`);
			if (__props.text) _push(`<p class="title" data-v-a581e1a7>${ssrInterpolate(__props.text)}</p>`);
			else _push(`<!---->`);
			_push(`<ul class="${ssrRenderClass({ "sub-groups": hasSubGroups.value })}" data-v-a581e1a7><!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<!--[-->`);
				if ("link" in item) _push(ssrRenderComponent(VPMenuLink_default, { item }, null, _parent));
				else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, {
					"screen-menu": unref(screen) || void 0,
					menu: !unref(screen) || void 0
				}), null), _parent);
				else _push(ssrRenderComponent(_component_VPMenuGroup, {
					text: item.text,
					items: item.items
				}, null, _parent));
				_push(`<!--]-->`);
			});
			_push(`<!--]--></ul></li>`);
		};
	}
};
var _sfc_setup$43 = _sfc_main$43.setup;
_sfc_main$43.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue");
	return _sfc_setup$43 ? _sfc_setup$43(props, ctx) : void 0;
};
var VPMenuGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$43, [["__scopeId", "data-v-a581e1a7"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue
var _sfc_main$42 = {
	__name: "VPMenu",
	__ssrInlineRender: true,
	props: { items: {
		type: Array,
		required: false
	} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenu" }, _attrs))} data-v-be0e6f32>`);
			if (__props.items) {
				_push(`<ul class="items" data-v-be0e6f32><!--[-->`);
				ssrRenderList(__props.items, (item) => {
					_push(`<!--[-->`);
					if ("link" in item) _push(ssrRenderComponent(VPMenuLink_default, { item }, null, _parent));
					else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { menu: "" }), null), _parent);
					else _push(ssrRenderComponent(VPMenuGroup_default, {
						text: item.text,
						items: item.items
					}, null, _parent));
					_push(`<!--]-->`);
				});
				_push(`<!--]--></ul>`);
			} else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$42 = _sfc_main$42.setup;
_sfc_main$42.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue");
	return _sfc_setup$42 ? _sfc_setup$42(props, ctx) : void 0;
};
var VPMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$42, [["__scopeId", "data-v-be0e6f32"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue
var _sfc_main$41 = {
	__name: "VPFlyout",
	__ssrInlineRender: true,
	props: {
		icon: {
			type: String,
			required: false
		},
		button: {
			type: String,
			required: false
		},
		label: {
			type: String,
			required: false
		},
		items: {
			type: Array,
			required: false
		}
	},
	setup(__props) {
		const open = ref(false);
		const el = useTemplateRef("el");
		useTemplateRef("buttonEl");
		useTemplateRef("menuEl");
		const menuId = useId();
		useFlyout({
			el,
			onBlur: close
		});
		const route = useRoute();
		watch(() => route.path, close);
		function close() {
			open.value = false;
		}
		onKeyStroke("Escape", () => {
			if (!open.value) return;
			const restoreFocus = el.value?.contains(document.activeElement);
			close();
			if (restoreFocus) el.value?.querySelector("button")?.focus();
		});
		useEventListener("pointerdown", (e) => {
			if (open.value && el.value && !el.value.contains(e.target)) close();
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "VPFlyout",
				ref_key: "el",
				ref: el
			}, _attrs))} data-v-7cc95988><button type="button" class="button"${ssrRenderAttr("aria-expanded", open.value)}${ssrRenderAttr("aria-controls", unref(menuId))}${ssrRenderAttr("aria-label", __props.label)} data-v-7cc95988>`);
			if (__props.button || __props.icon) {
				_push(`<span class="text" data-v-7cc95988>`);
				if (__props.icon) _push(`<span class="${ssrRenderClass([__props.icon, "option-icon"])}" aria-hidden="true" data-v-7cc95988></span>`);
				else _push(`<!---->`);
				if (__props.button) _push(`<span data-v-7cc95988>${__props.button ?? ""}</span>`);
				else _push(`<!---->`);
				_push(`<span class="vpi-chevron-down text-icon" aria-hidden="true" data-v-7cc95988></span></span>`);
			} else _push(`<span class="vpi-more-horizontal icon" aria-hidden="true" data-v-7cc95988></span>`);
			_push(`</button><div class="menu"${ssrRenderAttr("id", unref(menuId))} data-v-7cc95988>`);
			_push(ssrRenderComponent(VPMenu_default, { items: __props.items }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			_push(`</div></div>`);
		};
	}
};
var _sfc_setup$41 = _sfc_main$41.setup;
_sfc_main$41.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue");
	return _sfc_setup$41 ? _sfc_setup$41(props, ctx) : void 0;
};
var VPFlyout_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$41, [["__scopeId", "data-v-7cc95988"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavTranslations.vue
var _sfc_main$40 = {
	__name: "VPNavTranslations",
	__ssrInlineRender: true,
	props: {
		screen: {
			type: Boolean,
			required: false
		},
		menu: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const { localeLinks, currentLang } = useLangs({ linkToCorrespondingPage: true });
		const show = computed(() => !!(localeLinks.value.length && currentLang.value.label));
		const overflow = props.screen || props.menu ? null : useNavOverflow();
		const isCollapsed = computed(() => !!overflow && !overflow.state.translations);
		const isOpen = ref(false);
		const listId = useId();
		const localeProps = (locale) => ({
			lang: locale.lang,
			hreflang: locale.lang,
			rel: "alternate",
			dir: locale.dir,
			"data-allow-mismatch": "attribute"
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.screen && show.value) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavTranslations VPNavScreenTranslations", { open: isOpen.value }] }, _attrs))} data-v-6cb674f0><button type="button" class="title"${ssrRenderAttr("aria-expanded", isOpen.value)}${ssrRenderAttr("aria-controls", unref(listId))} data-v-6cb674f0><span class="vpi-languages icon lang" aria-hidden="true" data-v-6cb674f0></span> ${ssrInterpolate(unref(currentLang).label)} <span class="vpi-chevron-down icon chevron" aria-hidden="true" data-v-6cb674f0></span></button><ul${ssrRenderAttr("id", unref(listId))} class="list" style="${ssrRenderStyle(isOpen.value ? null : { display: "none" })}" data-v-6cb674f0><!--[-->`);
				ssrRenderList(unref(localeLinks), (locale) => {
					_push(`<li class="item" data-v-6cb674f0>`);
					_push(ssrRenderComponent(_sfc_main$64, mergeProps({
						class: "link",
						href: locale.link,
						external: false
					}, { ref_for: true }, localeProps(locale)), {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`${ssrInterpolate(locale.text)}`);
							else return [createTextVNode(toDisplayString(locale.text), 1)];
						}),
						_: 2
					}, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul></div>`);
			} else if (__props.menu && show.value) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavTranslations group translations" }, _attrs))} data-v-6cb674f0><p class="title" data-v-6cb674f0>${ssrInterpolate(unref(currentLang).label)}</p><ul data-v-6cb674f0><!--[-->`);
				ssrRenderList(unref(localeLinks), (locale) => {
					_push(ssrRenderComponent(VPMenuLink_default, mergeProps({
						item: locale,
						external: false
					}, { ref_for: true }, localeProps(locale)), null, _parent));
				});
				_push(`<!--]--></ul></div>`);
			} else if (!__props.menu && show.value) _push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: ["VPNavTranslations VPNavBarTranslations", { collapsed: isCollapsed.value }],
				icon: "vpi-languages",
				label: unref(theme).langMenuLabel || "Change language",
				ref: (inst) => unref(overflow)?.setClusterEl("translations", inst?.$el ?? null)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p class="title" data-v-6cb674f0${_scopeId}>${ssrInterpolate(unref(currentLang).label)}</p><ul class="items" data-v-6cb674f0${_scopeId}><!--[-->`);
						ssrRenderList(unref(localeLinks), (locale) => {
							_push(ssrRenderComponent(VPMenuLink_default, mergeProps({
								item: locale,
								external: false
							}, { ref_for: true }, localeProps(locale)), null, _parent, _scopeId));
						});
						_push(`<!--]--></ul>`);
					} else return [createVNode("p", { class: "title" }, toDisplayString(unref(currentLang).label), 1), createVNode("ul", { class: "items" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
						return openBlock(), createBlock(VPMenuLink_default, mergeProps({
							key: locale.link,
							item: locale,
							external: false
						}, { ref_for: true }, localeProps(locale)), null, 16, ["item"]);
					}), 128))])];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$40 = _sfc_main$40.setup;
_sfc_main$40.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavTranslations.vue");
	return _sfc_setup$40 ? _sfc_setup$40(props, ctx) : void 0;
};
var VPNavTranslations_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$40, [["__scopeId", "data-v-6cb674f0"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPIcon.vue
var _sfc_main$39 = {
	__name: "VPIcon",
	__ssrInlineRender: true,
	props: { icon: {
		type: [String, Object],
		required: true
	} },
	setup(__props) {
		const props = __props;
		const el = useTemplateRef("el");
		const iconClass = useIcon(() => props.icon, el);
		return (_ctx, _push, _parent, _attrs) => {
			if (typeof __props.icon === "object") _push(`<span${ssrRenderAttrs(mergeProps({ class: "VPIcon" }, _attrs))} data-v-890c5b71>${__props.icon.svg ?? ""}</span>`);
			else _push(`<span${ssrRenderAttrs(mergeProps({
				ref_key: "el",
				ref: el,
				class: unref(iconClass)
			}, _attrs))} data-v-890c5b71></span>`);
		};
	}
};
var _sfc_setup$39 = _sfc_main$39.setup;
_sfc_main$39.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPIcon.vue");
	return _sfc_setup$39 ? _sfc_setup$39(props, ctx) : void 0;
};
var VPIcon_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$39, [["__scopeId", "data-v-890c5b71"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue
var _sfc_main$38 = {
	__name: "VPSocialLink",
	__ssrInlineRender: true,
	props: {
		icon: {
			type: [String, Object],
			required: true
		},
		link: {
			type: String,
			required: true
		},
		ariaLabel: {
			type: String,
			required: false
		},
		target: {
			type: String,
			required: false
		},
		me: {
			type: Boolean,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const qualifiedIcon = computed(() => typeof props.icon === "string" && !props.icon.includes(":") ? `simple-icons:${props.icon}` : props.icon);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<a${ssrRenderAttrs(mergeProps({
				class: "VPSocialLink no-icon",
				href: __props.link,
				"aria-label": __props.ariaLabel ?? (typeof __props.icon === "string" ? __props.icon : ""),
				target: __props.target ?? (unref(isExternal)(__props.link) ? "_blank" : void 0),
				rel: __props.me ? "me noopener" : "noopener"
			}, _attrs))} data-v-b08e7265>`);
			_push(ssrRenderComponent(VPIcon_default, { icon: qualifiedIcon.value }, null, _parent));
			_push(`</a>`);
		};
	}
};
var _sfc_setup$38 = _sfc_main$38.setup;
_sfc_main$38.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue");
	return _sfc_setup$38 ? _sfc_setup$38(props, ctx) : void 0;
};
var VPSocialLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$38, [["__scopeId", "data-v-b08e7265"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue
var _sfc_main$37 = {
	__name: "VPSocialLinks",
	__ssrInlineRender: true,
	props: {
		links: {
			type: Array,
			required: true
		},
		me: {
			type: Boolean,
			required: false,
			default: true
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<ul${ssrRenderAttrs(mergeProps({ class: "VPSocialLinks" }, _attrs))} data-v-c257d51e><!--[-->`);
			ssrRenderList(__props.links, ({ link, icon, ariaLabel, target }) => {
				_push(`<li data-v-c257d51e>`);
				_push(ssrRenderComponent(VPSocialLink_default, {
					icon,
					link,
					ariaLabel,
					target,
					me: __props.me
				}, null, _parent));
				_push(`</li>`);
			});
			_push(`<!--]--></ul>`);
		};
	}
};
var _sfc_setup$37 = _sfc_main$37.setup;
_sfc_main$37.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue");
	return _sfc_setup$37 ? _sfc_setup$37(props, ctx) : void 0;
};
var VPSocialLinks_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$37, [["__scopeId", "data-v-c257d51e"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue
var _sfc_main$36 = {
	__name: "VPNavBarExtra",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const { localeLinks, currentLang } = useLangs({ linkToCorrespondingPage: true });
		const hasAppearanceSwitch = useAppearanceSwitch();
		const overflow = useNavOverflow();
		const overflowItems = computed(() => {
			const count = overflow?.state.visibleItemCount ?? Infinity;
			if (count === Infinity || !theme.value.nav) return [];
			return theme.value.nav.slice(count);
		});
		const showTranslations = computed(() => !!(localeLinks.value.length && currentLang.value.label) && !(overflow?.state.translations ?? true));
		const showAppearance = computed(() => hasAppearanceSwitch.value && !(overflow?.state.appearance ?? true));
		const showSocialLinks = computed(() => !!theme.value.socialLinks && !(overflow?.state.socialLinks ?? true));
		const hasContent = computed(() => overflowItems.value.length > 0 || showTranslations.value || showAppearance.value || showSocialLinks.value);
		return (_ctx, _push, _parent, _attrs) => {
			if (hasContent.value) _push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: "VPNavBarExtra",
				label: unref(theme).extraMenuLabel || "More options",
				ref: (inst) => unref(overflow)?.setExtraEl(inst?.$el ?? null)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (overflowItems.value.length) {
							_push(`<ul class="group overflow-items" data-v-f1efe52e${_scopeId}><!--[-->`);
							ssrRenderList(overflowItems.value, (item) => {
								_push(`<!--[-->`);
								if ("link" in item) _push(ssrRenderComponent(VPMenuLink_default, { item }, null, _parent, _scopeId));
								else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { menu: "" }), null), _parent, _scopeId);
								else _push(ssrRenderComponent(VPMenuGroup_default, {
									text: item.text,
									items: item.items
								}, null, _parent, _scopeId));
								_push(`<!--]-->`);
							});
							_push(`<!--]--></ul>`);
						} else _push(`<!---->`);
						if (showTranslations.value) _push(ssrRenderComponent(VPNavTranslations_default, { menu: "" }, null, _parent, _scopeId));
						else _push(`<!---->`);
						if (showAppearance.value) {
							_push(`<div class="group" data-v-f1efe52e${_scopeId}>`);
							_push(ssrRenderComponent(VPNavAppearance_default, { row: "" }, null, _parent, _scopeId));
							_push(`</div>`);
						} else _push(`<!---->`);
						if (showSocialLinks.value) {
							_push(`<div class="group" data-v-f1efe52e${_scopeId}><div class="item social-links" data-v-f1efe52e${_scopeId}>`);
							_push(ssrRenderComponent(VPSocialLinks_default, {
								class: "social-links-list",
								links: unref(theme).socialLinks
							}, null, _parent, _scopeId));
							_push(`</div></div>`);
						} else _push(`<!---->`);
					} else return [
						overflowItems.value.length ? (openBlock(), createBlock("ul", {
							key: 0,
							class: "group overflow-items"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(overflowItems.value, (item) => {
							return openBlock(), createBlock(Fragment, { key: JSON.stringify(item) }, ["link" in item ? (openBlock(), createBlock(VPMenuLink_default, {
								key: 0,
								item
							}, null, 8, ["item"])) : "component" in item ? (openBlock(), createBlock(resolveDynamicComponent(item.component), mergeProps({
								key: 1,
								ref_for: true
							}, item.props, { menu: "" }), null, 16)) : (openBlock(), createBlock(VPMenuGroup_default, {
								key: 2,
								text: item.text,
								items: item.items
							}, null, 8, ["text", "items"]))], 64);
						}), 128))])) : createCommentVNode("", true),
						showTranslations.value ? (openBlock(), createBlock(VPNavTranslations_default, {
							key: 1,
							menu: ""
						})) : createCommentVNode("", true),
						showAppearance.value ? (openBlock(), createBlock("div", {
							key: 2,
							class: "group"
						}, [createVNode(VPNavAppearance_default, { row: "" })])) : createCommentVNode("", true),
						showSocialLinks.value ? (openBlock(), createBlock("div", {
							key: 3,
							class: "group"
						}, [createVNode("div", { class: "item social-links" }, [createVNode(VPSocialLinks_default, {
							class: "social-links-list",
							links: unref(theme).socialLinks
						}, null, 8, ["links"])])])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$36 = _sfc_main$36.setup;
_sfc_main$36.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue");
	return _sfc_setup$36 ? _sfc_setup$36(props, ctx) : void 0;
};
var VPNavBarExtra_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$36, [["__scopeId", "data-v-f1efe52e"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue
var _sfc_main$35 = {
	__name: "VPNavBarHamburger",
	__ssrInlineRender: true,
	props: { active: {
		type: Boolean,
		required: true
	} },
	emits: ["click"],
	setup(__props) {
		const { theme } = useData();
		const el = useTemplateRef("el");
		const { screenTriggerEl } = useNav();
		watchEffect(() => {
			screenTriggerEl.value = el.value;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<button${ssrRenderAttrs(mergeProps({
				ref_key: "el",
				ref: el,
				type: "button",
				class: ["VPNavBarHamburger", { active: __props.active }],
				"aria-label": unref(theme).mobileMenuLabel || "Menu",
				"aria-expanded": __props.active
			}, _attrs))} data-v-32c75667><span class="container" aria-hidden="true" data-v-32c75667><span class="top" data-v-32c75667></span><span class="middle" data-v-32c75667></span><span class="bottom" data-v-32c75667></span></span></button>`);
		};
	}
};
var _sfc_setup$35 = _sfc_main$35.setup;
_sfc_main$35.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue");
	return _sfc_setup$35 ? _sfc_setup$35(props, ctx) : void 0;
};
var VPNavBarHamburger_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$35, [["__scopeId", "data-v-32c75667"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/support/docsearch.js
/**
* Resolves the effective mode based on config and available features.
*
* - 'auto': infer hybrid vs sidePanel-only from provided config
* - 'sidePanel': force sidePanel-only even if keyword search is configured
* - 'hybrid': force hybrid (error if keyword search is not configured)
* - 'modal': force modal even if sidePanel is configured
*/
function resolveMode(options) {
	const mode = options.mode ?? "auto";
	const hasKeyword = hasKeywordSearch(options);
	const askAi = options.askAi;
	const hasSidePanelConfig = Boolean(askAi && typeof askAi === "object" && askAi.sidePanel);
	switch (mode) {
		case "sidePanel": return {
			mode,
			showKeywordSearch: false,
			useSidePanel: true
		};
		case "hybrid":
			if (!hasKeyword) console.error("[vitepress] mode: \"hybrid\" requires keyword search credentials (appId, apiKey, indexName).");
			return {
				mode,
				showKeywordSearch: hasKeyword,
				useSidePanel: true
			};
		case "modal": return {
			mode,
			showKeywordSearch: hasKeyword,
			useSidePanel: false
		};
		default: return {
			mode: "auto",
			showKeywordSearch: hasKeyword,
			useSidePanel: hasSidePanelConfig
		};
	}
}
function hasKeywordSearch(options) {
	return Boolean(options.appId && options.apiKey && options.indexName);
}
/**
* Removes existing `lang:` filters and appends `lang:${lang}`.
* Handles both flat arrays and nested arrays (for OR conditions).
*/
function mergeLangFacetFilters(rawFacetFilters, lang) {
	return [...(Array.isArray(rawFacetFilters) ? rawFacetFilters : rawFacetFilters ? [rawFacetFilters] : []).map((filter) => {
		if (Array.isArray(filter)) return filter.filter((f) => typeof f === "string" && !f.startsWith("lang:"));
		return filter;
	}).filter((filter) => {
		if (typeof filter === "string") return !filter.startsWith("lang:");
		return Array.isArray(filter) && filter.length > 0;
	}), `lang:${lang}`];
}
/**
* Builds Ask AI configuration from various input formats.
*/
function buildAskAiConfig(askAiProp, options, lang) {
	const isAskAiString = typeof askAiProp === "string";
	const askAiSearchParameters = !isAskAiString && askAiProp.searchParameters ? { ...askAiProp.searchParameters } : void 0;
	const isAgentStudio = !isAskAiString && askAiProp.agentStudio === true;
	const askAiFacetFilters = mergeLangFacetFilters(askAiSearchParameters?.facetFilters ?? options.searchParameters?.facetFilters, lang);
	const mergedAskAiSearchParameters = isAgentStudio ? askAiSearchParameters : {
		...askAiSearchParameters,
		facetFilters: askAiFacetFilters.length ? askAiFacetFilters : void 0
	};
	const result = {
		...isAskAiString ? {} : askAiProp,
		indexName: isAskAiString ? options.indexName : askAiProp.indexName,
		apiKey: isAskAiString ? options.apiKey : askAiProp.apiKey,
		appId: isAskAiString ? options.appId : askAiProp.appId,
		assistantId: isAskAiString ? askAiProp : askAiProp.assistantId
	};
	if (mergedAskAiSearchParameters && Object.values(mergedAskAiSearchParameters).some((v) => v != null)) result.searchParameters = mergedAskAiSearchParameters;
	return result;
}
/**
* Resolves Algolia search options for the given language,
* merging in locale-specific overrides and language facet filters.
*/
function resolveOptionsForLanguage(options, localeIndex, lang) {
	options = deepMerge(options, options.locales?.[localeIndex] || {});
	const facetFilters = mergeLangFacetFilters(options.searchParameters?.facetFilters, lang);
	const askAi = options.askAi ? buildAskAiConfig(options.askAi, options, lang) : void 0;
	return {
		...options,
		searchParameters: {
			...options.searchParameters,
			facetFilters
		},
		askAi
	};
}
function deepMerge(target, source) {
	const result = { ...target };
	for (const key in source) {
		const value = source[key];
		if (value === void 0) continue;
		if (key === "searchParameters") {
			result[key] = value;
			continue;
		}
		if (isObject(value) && isObject(result[key])) result[key] = deepMerge(result[key], value);
		else result[key] = value;
	}
	delete result.locales;
	return result;
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/support/reactivity.js
function smartComputed(getter, comparator = (newValue, oldValue) => JSON.stringify(newValue) === JSON.stringify(oldValue)) {
	return computed((oldValue) => {
		const newValue = getter();
		return oldValue === void 0 || !comparator(newValue, oldValue) ? newValue : oldValue;
	});
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavBarAskAiButton.vue
var _sfc_main$34 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
	_push(`<button${ssrRenderAttrs(mergeProps({
		type: "button",
		class: "VPNavBarAskAiButton"
	}, _attrs))} data-v-4c862795><span class="vpi-sparkles" aria-hidden="true" data-v-4c862795></span></button>`);
}
var _sfc_setup$34 = _sfc_main$34.setup;
_sfc_main$34.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavBarAskAiButton.vue");
	return _sfc_setup$34 ? _sfc_setup$34(props, ctx) : void 0;
};
var VPNavBarAskAiButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$34, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-4c862795"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue
var _sfc_main$33 = {
	__name: "VPNavBarSearchButton",
	__ssrInlineRender: true,
	props: { text: {
		type: String,
		required: true
	} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<button${ssrRenderAttrs(mergeProps({
				type: "button",
				class: "VPNavBarSearchButton"
			}, _attrs))} data-v-74241663><span class="vpi-search" aria-hidden="true" data-v-74241663></span><span class="text" data-v-74241663>${ssrInterpolate(__props.text)}</span><span class="keys" aria-hidden="true" data-v-74241663><kbd class="key-mod" data-v-74241663></kbd><kbd class="key-k" data-v-74241663></kbd></span></button>`);
		};
	}
};
var _sfc_setup$33 = _sfc_main$33.setup;
_sfc_main$33.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue");
	return _sfc_setup$33 ? _sfc_setup$33(props, ctx) : void 0;
};
var VPNavBarSearchButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$33, [["__scopeId", "data-v-74241663"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue
var _sfc_main$32 = {
	__name: "VPNavBarSearch",
	__ssrInlineRender: true,
	setup(__props) {
		const VPLocalSearchBox = defineAsyncComponent(() => import("./VPLocalSearchBox.BG0_B7q6.js"));
		const VPAlgoliaSearchBox = () => null;
		const { theme, localeIndex, lang } = useData();
		const provider = "local";
		const algoliaOptions = smartComputed(() => {
			return resolveOptionsForLanguage(theme.value.search?.options || {}, localeIndex.value, lang.value);
		});
		const resolvedMode = computed(() => resolveMode(algoliaOptions.value));
		const askAiSidePanelConfig = computed(() => {
			if (!resolvedMode.value.useSidePanel) return null;
			const askAi = algoliaOptions.value.askAi;
			if (!askAi || typeof askAi === "string") return null;
			if (!askAi.sidePanel) return null;
			return askAi.sidePanel === true ? {} : askAi.sidePanel;
		});
		const askAiShortcutEnabled = computed(() => {
			return askAiSidePanelConfig.value?.keyboardShortcuts?.["Ctrl/Cmd+I"] !== false;
		});
		const openRequest = ref(null);
		let openNonce = 0;
		const loaded = ref(false);
		const actuallyLoaded = ref(false);
		onMounted(() => {});
		function loadAndOpen(target) {
			if (!loaded.value) loaded.value = true;
			openRequest.value = {
				target,
				nonce: ++openNonce
			};
		}
		const showSearch = ref(false);
		onKeyStroke("k", (event) => {
			if (event.ctrlKey || event.metaKey) {
				event.preventDefault();
				showSearch.value = true;
			}
		});
		onKeyStroke("/", (event) => {
			if (!isEditingContent(event)) {
				event.preventDefault();
				showSearch.value = true;
			}
		});
		function isEditingContent(event) {
			const element = event.target;
			const tagName = element.tagName;
			return element.isContentEditable || tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA";
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavBarSearch" }, _attrs))} data-v-23cefeba>`);
			if (unref(provider) === "algolia") {
				_push(`<!--[-->`);
				if (resolvedMode.value.showKeywordSearch) _push(ssrRenderComponent(VPNavBarSearchButton_default, {
					text: unref(algoliaOptions).translations?.button?.buttonText || "Search",
					"aria-label": unref(algoliaOptions).translations?.button?.buttonAriaLabel || "Search",
					"aria-keyshortcuts": "/ control+k meta+k",
					onClick: ($event) => loadAndOpen("search")
				}, null, _parent));
				else _push(`<!---->`);
				if (askAiSidePanelConfig.value) _push(ssrRenderComponent(VPNavBarAskAiButton_default, {
					"aria-label": askAiSidePanelConfig.value.button?.translations?.buttonAriaLabel || "Ask AI",
					"aria-keyshortcuts": askAiShortcutEnabled.value ? "control+i meta+i" : void 0,
					onClick: ($event) => actuallyLoaded.value ? loadAndOpen("toggleAskAi") : loadAndOpen("askAi")
				}, null, _parent));
				else _push(`<!---->`);
				if (loaded.value) _push(ssrRenderComponent(unref(VPAlgoliaSearchBox), {
					"algolia-options": unref(algoliaOptions),
					"open-request": openRequest.value,
					onVnodeBeforeMount: ($event) => actuallyLoaded.value = true
				}, null, _parent));
				else _push(`<!---->`);
				_push(`<!--]-->`);
			} else if (unref(provider) === "local") {
				_push(`<!--[-->`);
				_push(ssrRenderComponent(VPNavBarSearchButton_default, {
					text: unref(algoliaOptions).translations?.button?.buttonText || "Search",
					"aria-label": unref(algoliaOptions).translations?.button?.buttonAriaLabel || "Search",
					"aria-keyshortcuts": "/ control+k meta+k",
					onClick: ($event) => showSearch.value = true
				}, null, _parent));
				if (showSearch.value) _push(ssrRenderComponent(unref(VPLocalSearchBox), { onClose: ($event) => showSearch.value = false }, null, _parent));
				else _push(`<!---->`);
				_push(`<!--]-->`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$32 = _sfc_main$32.setup;
_sfc_main$32.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue");
	return _sfc_setup$32 ? _sfc_setup$32(props, ctx) : void 0;
};
var VPNavBarSearch_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$32, [["__scopeId", "data-v-23cefeba"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue
var _sfc_main$31 = {
	__name: "VPNavBarTitle",
	__ssrInlineRender: true,
	setup(__props) {
		const { site, theme } = useData();
		const { hasSidebar } = useLayout();
		const { currentLang } = useLangs();
		const link = computed(() => typeof theme.value.logoLink === "string" ? theme.value.logoLink : theme.value.logoLink?.link);
		const rel = computed(() => typeof theme.value.logoLink === "string" ? void 0 : theme.value.logoLink?.rel);
		const target = computed(() => typeof theme.value.logoLink === "string" ? void 0 : theme.value.logoLink?.target);
		const textTitle = computed(() => {
			if (theme.value.siteTitle === false) return void 0;
			return (theme.value.siteTitle ?? site.value.title).replace(/<[^>]+>/g, "").trim() || void 0;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavBarTitle", { "has-sidebar": unref(hasSidebar) }] }, _attrs))} data-v-c8132227><a class="title"${ssrRenderAttr("href", link.value ?? unref(normalizeLink$1)(unref(currentLang).link))}${ssrRenderAttr("rel", rel.value)}${ssrRenderAttr("target", target.value)}${ssrRenderAttr("title", textTitle.value)} data-v-c8132227>`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent);
			if (unref(theme).logo) _push(ssrRenderComponent(VPImage_default, {
				class: "logo",
				image: unref(theme).logo
			}, null, _parent));
			else _push(`<!---->`);
			if (unref(theme).siteTitle) _push(`<span data-v-c8132227>${unref(theme).siteTitle ?? ""}</span>`);
			else if (unref(theme).siteTitle === void 0) _push(`<span data-v-c8132227>${ssrInterpolate(unref(site).title)}</span>`);
			else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent);
			_push(`</a></div>`);
		};
	}
};
var _sfc_setup$31 = _sfc_main$31.setup;
_sfc_main$31.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue");
	return _sfc_setup$31 ? _sfc_setup$31(props, ctx) : void 0;
};
var VPNavBarTitle_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$31, [["__scopeId", "data-v-c8132227"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavMenuGroup.vue
var _sfc_main$30 = {
	__name: "VPNavMenuGroup",
	__ssrInlineRender: true,
	props: {
		item: {
			type: Object,
			required: true
		},
		screen: {
			type: Boolean,
			required: false
		},
		menu: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const route = useRoute();
		const isActiveGroup = computed(() => {
			if (props.item.activeMatch) return isActive(route.data.relativePath, route.hash, props.item.activeMatch, true);
			return isChildActive(props.item);
		});
		function isChildActive(navItem) {
			if ("component" in navItem) return false;
			if ("link" in navItem) {
				const href = typeof navItem.link === "function" ? navItem.link(route.data) : navItem.link;
				return isActive(route.data.relativePath, route.hash, navItem.activeMatch || href, !!navItem.activeMatch);
			}
			return navItem.items.some(isChildActive);
		}
		const isOpen = ref(false);
		const groupId = useId();
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.menu) _push(ssrRenderComponent(VPMenuGroup_default, mergeProps({
				class: "VPNavMenuGroup",
				text: __props.item.text,
				items: __props.item.items
			}, _attrs), null, _parent));
			else if (!__props.screen) _push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: {
					VPNavMenuGroup: true,
					VPNavBarMenuGroup: true,
					active: isActiveGroup.value
				},
				button: __props.item.text,
				items: __props.item.items
			}, _attrs), null, _parent));
			else {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavMenuGroup VPNavScreenMenuGroup", {
					open: isOpen.value,
					active: isActiveGroup.value
				}] }, _attrs))} data-v-108f7c8b><button type="button" class="button"${ssrRenderAttr("aria-expanded", isOpen.value)}${ssrRenderAttr("aria-controls", unref(groupId))} data-v-108f7c8b><span class="button-text" data-v-108f7c8b>${__props.item.text ?? ""}</span><span class="vpi-plus button-icon" aria-hidden="true" data-v-108f7c8b></span></button><ul${ssrRenderAttr("id", unref(groupId))} class="items" style="${ssrRenderStyle(isOpen.value ? null : { display: "none" })}" data-v-108f7c8b><!--[-->`);
				ssrRenderList(__props.item.items, (child) => {
					_push(`<!--[-->`);
					if ("link" in child) _push(ssrRenderComponent(VPMenuLink_default, { item: child }, null, _parent));
					else if ("component" in child) {
						_push(`<li data-v-108f7c8b>`);
						ssrRenderVNode(_push, createVNode(resolveDynamicComponent(child.component), mergeProps({ ref_for: true }, child.props, { "screen-menu": "" }), null), _parent);
						_push(`</li>`);
					} else _push(ssrRenderComponent(VPMenuGroup_default, {
						text: child.text,
						items: child.items
					}, null, _parent));
					_push(`<!--]-->`);
				});
				_push(`<!--]--></ul></div>`);
			}
		};
	}
};
var _sfc_setup$30 = _sfc_main$30.setup;
_sfc_main$30.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavMenuGroup.vue");
	return _sfc_setup$30 ? _sfc_setup$30(props, ctx) : void 0;
};
var VPNavMenuGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$30, [["__scopeId", "data-v-108f7c8b"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavMenuLink.vue
var _sfc_main$29 = {
	__name: "VPNavMenuLink",
	__ssrInlineRender: true,
	props: {
		item: {
			type: Object,
			required: true
		},
		screen: {
			type: Boolean,
			required: false
		}
	},
	setup(__props) {
		const props = __props;
		const { href, isActiveLink, isCurrentLink } = useNavItemLink(() => props.item);
		const nav = inject(navInjectionKey, null);
		function onClick() {
			if (props.screen) nav?.closeScreen();
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(_sfc_main$64, mergeProps({
				class: ["VPNavMenuLink", {
					VPNavBarMenuLink: !__props.screen,
					VPNavScreenMenuLink: __props.screen,
					active: unref(isActiveLink)
				}],
				"aria-current": unref(isCurrentLink) ? "page" : void 0,
				href: unref(href),
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon,
				onClick
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-e441a3d4${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$29 = _sfc_main$29.setup;
_sfc_main$29.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavMenuLink.vue");
	return _sfc_setup$29 ? _sfc_setup$29(props, ctx) : void 0;
};
var VPNavMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$29, [["__scopeId", "data-v-e441a3d4"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavMenu.vue
var _sfc_main$28 = {
	__name: "VPNavMenu",
	__ssrInlineRender: true,
	props: { screen: {
		type: Boolean,
		required: false
	} },
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const overflow = props.screen ? null : useNavOverflow();
		function isVisible(index) {
			return !overflow || index < overflow.state.visibleItemCount;
		}
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).nav) {
				_push(`<nav${ssrRenderAttrs(mergeProps({
					"aria-label": unref(theme).navMenuLabel || "Main Navigation",
					class: ["VPNavMenu", __props.screen ? "VPNavScreenMenu" : "VPNavBarMenu"],
					ref: (el) => unref(overflow)?.setMenuEl(el)
				}, _attrs))} data-v-7c501401><ul class="list" data-v-7c501401><!--[-->`);
				ssrRenderList(unref(theme).nav, (item, index) => {
					_push(`<li class="${ssrRenderClass({ collapsed: !isVisible(index) })}" data-v-7c501401>`);
					if ("link" in item) _push(ssrRenderComponent(VPNavMenuLink_default, {
						item,
						screen: __props.screen
					}, null, _parent));
					else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { "screen-menu": __props.screen || void 0 }), null), _parent);
					else _push(ssrRenderComponent(VPNavMenuGroup_default, {
						item,
						screen: __props.screen
					}, null, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul></nav>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$28 = _sfc_main$28.setup;
_sfc_main$28.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavMenu.vue");
	return _sfc_setup$28 ? _sfc_setup$28(props, ctx) : void 0;
};
var VPNavMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$28, [["__scopeId", "data-v-7c501401"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavSocialLinks.vue
var _sfc_main$27 = {
	__name: "VPNavSocialLinks",
	__ssrInlineRender: true,
	props: { screen: {
		type: Boolean,
		required: false
	} },
	setup(__props) {
		const props = __props;
		const { theme } = useData();
		const overflow = props.screen ? null : useNavOverflow();
		const isCollapsed = computed(() => !!overflow && !overflow.state.socialLinks);
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).socialLinks) _push(ssrRenderComponent(VPSocialLinks_default, mergeProps({
				class: ["VPNavSocialLinks", [__props.screen ? "VPNavScreenSocialLinks" : "VPNavBarSocialLinks", { collapsed: isCollapsed.value }]],
				links: unref(theme).socialLinks,
				ref: (inst) => unref(overflow)?.setClusterEl("socialLinks", inst?.$el ?? null)
			}, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$27 = _sfc_main$27.setup;
_sfc_main$27.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavSocialLinks.vue");
	return _sfc_setup$27 ? _sfc_setup$27(props, ctx) : void 0;
};
var VPNavSocialLinks_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$27, [["__scopeId", "data-v-07f6e6d5"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue
var _sfc_main$26 = {
	__name: "VPNavBar",
	__ssrInlineRender: true,
	props: { isScreenOpen: {
		type: Boolean,
		required: true
	} },
	emits: ["toggle-screen"],
	setup(__props) {
		const { theme } = useData();
		const { isHome, hasSidebar, hasLocalNav } = useLayout();
		const { y } = useWindowScroll();
		const isTop = computed(() => y.value <= 0);
		provideNavOverflow({ itemsKey: () => JSON.stringify(theme.value.nav ?? null) });
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavBar", {
				"has-sidebar": unref(hasSidebar),
				"has-local-nav": !unref(isHome) && unref(hasLocalNav),
				"home": unref(isHome),
				"top": isTop.value,
				"screen-open": __props.isScreenOpen
			}] }, _attrs))} data-v-8f4848b5><div class="wrapper" data-v-8f4848b5><div class="container" data-v-8f4848b5><div class="title" data-v-8f4848b5>`);
			_push(ssrRenderComponent(VPNavBarTitle_default, null, {
				"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
				}),
				"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			_push(`</div><div class="content" data-v-8f4848b5><div class="content-body" data-v-8f4848b5>`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPNavBarSearch_default, { class: "search" }, null, _parent));
			_push(ssrRenderComponent(VPNavMenu_default, { class: "menu" }, null, _parent));
			_push(ssrRenderComponent(VPNavTranslations_default, { class: "translations" }, null, _parent));
			_push(ssrRenderComponent(VPNavAppearance_default, { class: "appearance" }, null, _parent));
			_push(ssrRenderComponent(VPNavSocialLinks_default, { class: "social-links" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarExtra_default, { class: "extra" }, null, _parent));
			ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPNavBarHamburger_default, {
				class: "hamburger",
				active: __props.isScreenOpen,
				onClick: ($event) => _ctx.$emit("toggle-screen")
			}, null, _parent));
			_push(`</div></div></div></div><div class="divider" data-v-8f4848b5><div class="divider-line" data-v-8f4848b5></div></div></div>`);
		};
	}
};
var _sfc_setup$26 = _sfc_main$26.setup;
_sfc_main$26.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue");
	return _sfc_setup$26 ? _sfc_setup$26(props, ctx) : void 0;
};
var VPNavBar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$26, [["__scopeId", "data-v-8f4848b5"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue
var _sfc_main$25 = {
	__name: "VPNavScreen",
	__ssrInlineRender: true,
	props: { open: {
		type: Boolean,
		required: true
	} },
	setup(__props) {
		const props = __props;
		useBodyScrollLock();
		provide(navScreenInjectionKey, true);
		const { closeScreen, screenTriggerEl } = useNav();
		onKeyStroke("Escape", () => {
			if (!props.open) return;
			closeScreen();
			screenTriggerEl.value?.focus();
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.open) {
				_push(`<div${ssrRenderAttrs(mergeProps({
					class: "VPNavScreen",
					id: "VPNavScreen"
				}, _attrs))} data-v-c1f0fd02><div class="container" data-v-c1f0fd02>`);
				ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPNavMenu_default, {
					screen: "",
					class: "menu"
				}, null, _parent));
				_push(ssrRenderComponent(VPNavTranslations_default, {
					screen: "",
					class: "translations"
				}, null, _parent));
				_push(ssrRenderComponent(VPNavAppearance_default, {
					row: "",
					screen: "",
					class: "appearance"
				}, null, _parent));
				_push(ssrRenderComponent(VPNavSocialLinks_default, {
					screen: "",
					class: "social-links"
				}, null, _parent));
				ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent);
				_push(`</div></div>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$25 = _sfc_main$25.setup;
_sfc_main$25.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue");
	return _sfc_setup$25 ? _sfc_setup$25(props, ctx) : void 0;
};
var VPNavScreen_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$25, [["__scopeId", "data-v-c1f0fd02"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPNav.vue
var _sfc_main$24 = {
	__name: "VPNav",
	__ssrInlineRender: true,
	setup(__props) {
		const { isScreenOpen, closeScreen, toggleScreen } = useNav();
		const { frontmatter } = useData();
		const hasNavbar = computed(() => {
			return frontmatter.value.navbar !== false;
		});
		provide(navInjectionKey, { closeScreen });
		watchEffect(() => {
			if (inBrowser) document.documentElement.classList.toggle("hide-nav", !hasNavbar.value);
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (hasNavbar.value) {
				_push(`<header${ssrRenderAttrs(mergeProps({ class: "VPNav" }, _attrs))} data-v-21c0505c>`);
				_push(ssrRenderComponent(VPNavBar_default, {
					"is-screen-open": unref(isScreenOpen),
					onToggleScreen: unref(toggleScreen)
				}, {
					"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
					}),
					"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
					}),
					"nav-bar-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)];
					}),
					"nav-bar-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPNavScreen_default, { open: unref(isScreenOpen) }, {
					"nav-screen-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)];
					}),
					"nav-screen-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(`</header>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$24 = _sfc_main$24.setup;
_sfc_main$24.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPNav.vue");
	return _sfc_setup$24 ? _sfc_setup$24(props, ctx) : void 0;
};
var VPNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$24, [["__scopeId", "data-v-21c0505c"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue
var _sfc_main$23 = {
	__name: "VPSidebarItem",
	__ssrInlineRender: true,
	props: {
		item: {
			type: Object,
			required: true
		},
		depth: {
			type: Number,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const { collapsed, collapsible, isLink, isActiveLink, isCurrentLink, hasActiveLink, hasChildren, toggle } = useSidebarItemControl(computed(() => props.item));
		const linkTag = computed(() => isLink.value ? "a" : "div");
		const textTag = computed(() => hasChildren.value && props.depth < 5 ? `h${props.depth + 2}` : "p");
		const sectionTag = computed(() => props.item.text && textTag.value !== "p" ? "section" : "div");
		function onItemClick() {
			!props.item.link && toggle();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPSidebarItem = resolveComponent("VPSidebarItem", true);
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(sectionTag.value), mergeProps({ class: ["VPSidebarItem", [`level-${__props.depth}`, {
				collapsible: unref(collapsible),
				collapsed: unref(collapsed),
				"is-link": unref(isLink),
				"is-active": unref(isActiveLink),
				"has-active": unref(hasActiveLink)
			}]] }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (__props.item.text) {
							_push(`<div class="item" data-v-508f7dbf${_scopeId}><div class="indicator" data-v-508f7dbf${_scopeId}></div>`);
							if (__props.item.link) _push(ssrRenderComponent(_sfc_main$64, {
								tag: linkTag.value,
								class: "link",
								"aria-current": unref(isCurrentLink) ? "page" : void 0,
								href: __props.item.link,
								rel: __props.item.rel,
								target: __props.item.target
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(textTag.value), { class: "text" }, null), _parent, _scopeId);
									else return [(openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
										class: "text",
										innerHTML: __props.item.text
									}, null, 8, ["innerHTML"]))];
								}),
								_: 1
							}, _parent, _scopeId));
							else ssrRenderVNode(_push, createVNode(resolveDynamicComponent(textTag.value), { class: "text" }, null), _parent, _scopeId);
							if (__props.item.collapsed != null && __props.item.items && __props.item.items.length) _push(`<button type="button" class="caret" aria-label="toggle section"${ssrRenderAttr("aria-expanded", !unref(collapsed))} data-v-508f7dbf${_scopeId}><span class="vpi-chevron-right caret-icon" data-v-508f7dbf${_scopeId}></span></button>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						if (__props.item.items && __props.item.items.length) {
							_push(`<ul class="items" data-v-508f7dbf${_scopeId}>`);
							if (__props.depth < 5) {
								_push(`<li data-v-508f7dbf${_scopeId}><!--[-->`);
								ssrRenderList(__props.item.items, (i) => {
									_push(ssrRenderComponent(_component_VPSidebarItem, {
										key: i.text,
										item: i,
										depth: __props.depth + 1
									}, null, _parent, _scopeId));
								});
								_push(`<!--]--></li>`);
							} else _push(`<!---->`);
							_push(`</ul>`);
						} else _push(`<!---->`);
					} else return [__props.item.text ? (openBlock(), createBlock("div", {
						key: 0,
						class: "item",
						onClick: onItemClick
					}, [
						createVNode("div", { class: "indicator" }),
						__props.item.link ? (openBlock(), createBlock(_sfc_main$64, {
							key: 0,
							tag: linkTag.value,
							class: "link",
							"aria-current": unref(isCurrentLink) ? "page" : void 0,
							href: __props.item.link,
							rel: __props.item.rel,
							target: __props.item.target
						}, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
								class: "text",
								innerHTML: __props.item.text
							}, null, 8, ["innerHTML"]))]),
							_: 1
						}, 8, [
							"tag",
							"aria-current",
							"href",
							"rel",
							"target"
						])) : (openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
							key: 1,
							class: "text",
							innerHTML: __props.item.text
						}, null, 8, ["innerHTML"])),
						__props.item.collapsed != null && __props.item.items && __props.item.items.length ? (openBlock(), createBlock("button", {
							key: 2,
							type: "button",
							class: "caret",
							"aria-label": "toggle section",
							"aria-expanded": !unref(collapsed),
							onClick: withModifiers(unref(toggle), ["stop"])
						}, [createVNode("span", { class: "vpi-chevron-right caret-icon" })], 8, ["aria-expanded", "onClick"])) : createCommentVNode("", true)
					])) : createCommentVNode("", true), __props.item.items && __props.item.items.length ? (openBlock(), createBlock("ul", {
						key: 1,
						class: "items"
					}, [__props.depth < 5 ? (openBlock(), createBlock("li", { key: 0 }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.item.items, (i) => {
						return openBlock(), createBlock(_component_VPSidebarItem, {
							key: i.text,
							item: i,
							depth: __props.depth + 1
						}, null, 8, ["item", "depth"]);
					}), 128))])) : createCommentVNode("", true)])) : createCommentVNode("", true)];
				}),
				_: 1
			}), _parent);
		};
	}
};
var _sfc_setup$23 = _sfc_main$23.setup;
_sfc_main$23.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue");
	return _sfc_setup$23 ? _sfc_setup$23(props, ctx) : void 0;
};
var VPSidebarItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$23, [["__scopeId", "data-v-508f7dbf"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue
var _sfc_main$22 = {
	__name: "VPSidebarGroup",
	__ssrInlineRender: true,
	props: { items: {
		type: Array,
		required: true
	} },
	setup(__props) {
		const disableTransition = ref(true);
		let timer = null;
		onMounted(() => {
			timer = setTimeout(() => {
				timer = null;
				disableTransition.value = false;
			}, 300);
		});
		onBeforeUnmount(() => {
			if (timer != null) {
				clearTimeout(timer);
				timer = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<div class="${ssrRenderClass([{ "no-transition": disableTransition.value }, "group"])}" data-v-bd6fbf8d>`);
				_push(ssrRenderComponent(VPSidebarItem_default, {
					item,
					depth: 0
				}, null, _parent));
				_push(`</div>`);
			});
			_push(`<!--]-->`);
		};
	}
};
var _sfc_setup$22 = _sfc_main$22.setup;
_sfc_main$22.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue");
	return _sfc_setup$22 ? _sfc_setup$22(props, ctx) : void 0;
};
var VPSidebarGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$22, [["__scopeId", "data-v-bd6fbf8d"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue
var _sfc_main$21 = {
	__name: "VPSidebar",
	__ssrInlineRender: true,
	props: { open: {
		type: Boolean,
		required: true
	} },
	setup(__props) {
		const { sidebarGroups, hasSidebar } = useLayout();
		const props = __props;
		const navEl = useTemplateRef("navEl");
		const isLocked = useBodyScrollLock();
		watch([() => props.open, navEl], () => {
			if (props.open) {
				isLocked.value = true;
				navEl.value?.focus();
			} else isLocked.value = false;
		}, {
			immediate: true,
			flush: "post"
		});
		const key = ref(0);
		watch(sidebarGroups, () => {
			key.value += 1;
		}, { deep: true });
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(hasSidebar)) {
				_push(`<aside${ssrRenderAttrs(mergeProps({
					class: ["VPSidebar", { open: __props.open }],
					ref_key: "navEl",
					ref: navEl
				}, _attrs))} data-v-a61a820c><div class="curtain" data-v-a61a820c></div><nav class="nav" id="VPSidebarNav" aria-labelledby="sidebar-aria-label" tabindex="-1" data-v-a61a820c><span class="visually-hidden" id="sidebar-aria-label" data-v-a61a820c> Sidebar Navigation </span>`);
				ssrRenderSlot(_ctx.$slots, "sidebar-nav-before", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPSidebarGroup_default, {
					items: unref(sidebarGroups),
					key: key.value
				}, null, _parent));
				ssrRenderSlot(_ctx.$slots, "sidebar-nav-after", {}, null, _push, _parent);
				_push(`</nav></aside>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$21 = _sfc_main$21.setup;
_sfc_main$21.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue");
	return _sfc_setup$21 ? _sfc_setup$21(props, ctx) : void 0;
};
var VPSidebar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$21, [["__scopeId", "data-v-a61a820c"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue
var _sfc_main$20 = {
	__name: "VPSkipLink",
	__ssrInlineRender: true,
	props: { inert: {
		type: Boolean,
		required: false
	} },
	setup(__props) {
		const { theme } = useData();
		const route = useRoute();
		const backToTop = useTemplateRef("backToTop");
		watch(() => route.path, () => backToTop.value?.focus());
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[--><span tabindex="-1" data-v-499bdcc5></span><a href="#VPContent" class="VPSkipLink visually-hidden"${ssrIncludeBooleanAttr(__props.inert) ? " inert" : ""} data-v-499bdcc5>${ssrInterpolate(unref(theme).skipToContentLabel || "Skip to content")}</a><!--]-->`);
		};
	}
};
var _sfc_setup$20 = _sfc_main$20.setup;
_sfc_main$20.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue");
	return _sfc_setup$20 ? _sfc_setup$20(props, ctx) : void 0;
};
var VPSkipLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$20, [["__scopeId", "data-v-499bdcc5"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/Layout.vue
var _sfc_main$19 = {
	__name: "Layout",
	__ssrInlineRender: true,
	setup(__props) {
		const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebarControl();
		const { isScreenOpen } = useNav();
		registerWatchers({ closeSidebar });
		const { frontmatter, theme } = useData();
		const slots = useSlots();
		const heroImageSlotExists = computed(() => !!slots["home-hero-image"]);
		provide(layoutInfoInjectionKey, { heroImageSlotExists });
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			if (unref(frontmatter).layout !== false) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: ["Layout", [unref(frontmatter).pageClass, unref(theme).gradedContainers && "vp-graded-containers"]] }, _attrs))} data-v-7e38a135>`);
				ssrRenderSlot(_ctx.$slots, "layout-top", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPSkipLink_default, { inert: unref(isScreenOpen) }, null, _parent));
				_push(ssrRenderComponent(VPBackdrop_default, {
					class: "backdrop",
					show: unref(isSidebarOpen),
					onClick: unref(closeSidebar)
				}, null, _parent));
				_push(ssrRenderComponent(VPNav_default, null, {
					"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
					}),
					"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
					}),
					"nav-bar-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)];
					}),
					"nav-bar-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)];
					}),
					"nav-screen-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)];
					}),
					"nav-screen-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPLocalNav_default, {
					open: unref(isSidebarOpen),
					onOpenMenu: unref(openSidebar),
					inert: unref(isScreenOpen)
				}, null, _parent));
				_push(ssrRenderComponent(VPSidebar_default, {
					open: unref(isSidebarOpen),
					inert: unref(isScreenOpen)
				}, {
					"sidebar-nav-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "sidebar-nav-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "sidebar-nav-before", {}, void 0, true)];
					}),
					"sidebar-nav-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "sidebar-nav-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "sidebar-nav-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPContent_default, { inert: unref(isScreenOpen) }, {
					"page-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "page-top", {}, void 0, true)];
					}),
					"page-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)];
					}),
					"not-found": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "not-found", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "not-found", {}, void 0, true)];
					}),
					"home-hero-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)];
					}),
					"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
					}),
					"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
					}),
					"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
					}),
					"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
					}),
					"home-hero-actions-before-actions": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)];
					}),
					"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
					}),
					"home-hero-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)];
					}),
					"home-features-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)];
					}),
					"home-features-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)];
					}),
					"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
					}),
					"doc-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)];
					}),
					"doc-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)];
					}),
					"doc-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)];
					}),
					"doc-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)];
					}),
					"aside-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
					}),
					"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
					}),
					"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
					}),
					"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
					}),
					"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
					}),
					"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPFooter_default, { inert: unref(isScreenOpen) }, null, _parent));
				ssrRenderSlot(_ctx.$slots, "layout-bottom", {}, null, _push, _parent);
				_push(`</div>`);
			} else _push(ssrRenderComponent(_component_Content, _attrs, null, _parent));
		};
	}
};
var _sfc_setup$19 = _sfc_main$19.setup;
_sfc_main$19.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/Layout.vue");
	return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
var Layout_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$19, [["__scopeId", "data-v-7e38a135"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/composables/sponsor-grid.js
/**
* Defines grid configuration for each sponsor size in tuple.
*
* [Screen width (rem), Column size]
*
* It sets grid size on matching screen size. For example, `[48, 5]` will
* set 5 columns when the screen is at least 48rem wide.
*
* Column will set only when item size is bigger than the column size. For
* example, even we define 5 columns, if we only have 1 sponsor yet, we would
* like to show it in 1 column to make it stand out.
*/
var GridSettings = {
	xmini: [[0, 2]],
	mini: [],
	small: [
		[57.5, 6],
		[48, 5],
		[40, 4],
		[30, 3],
		[0, 2]
	],
	medium: [
		[60, 5],
		[52, 4],
		[40, 3],
		[30, 2]
	],
	big: [[52, 3], [40, 2]]
};
function useSponsorsGrid({ el, size = "medium" }) {
	const onResize = throttleAndDebounce(manage, 100);
	onMounted(() => {
		manage();
		window.addEventListener("resize", onResize);
	});
	onUnmounted(() => {
		window.removeEventListener("resize", onResize);
	});
	function manage() {
		if (el.value) adjustSlots(el.value, size);
	}
}
function adjustSlots(el, size) {
	const tsize = el.children.length;
	const asize = el.querySelectorAll(".vp-sponsor-grid-item:not(.empty)").length;
	manageSlots(el, setGrid(el, size, asize), tsize, asize);
}
function setGrid(el, size, items) {
	const settings = GridSettings[size];
	let grid = 1;
	settings.some(([breakpoint, value]) => {
		if (window.matchMedia(`(min-width: ${breakpoint}rem)`).matches) {
			grid = items < value ? items : value;
			return true;
		}
	});
	setGridData(el, grid);
	return grid;
}
function setGridData(el, value) {
	el.dataset.vpGrid = String(value);
}
function manageSlots(el, grid, tsize, asize) {
	const diff = tsize - asize;
	const rem = asize % grid;
	neutralizeSlots(el, (rem === 0 ? rem : grid - rem) - diff);
}
function neutralizeSlots(el, count) {
	if (count === 0) return;
	count > 0 ? addSlots(el, count) : removeSlots(el, count * -1);
}
function addSlots(el, count) {
	for (let i = 0; i < count; i++) {
		const slot = document.createElement("div");
		slot.classList.add("vp-sponsor-grid-item", "empty");
		el.append(slot);
	}
}
function removeSlots(el, count) {
	for (let i = 0; i < count; i++) el.removeChild(el.lastElementChild);
}
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue
var _sfc_main$18 = {
	__name: "VPSponsorsGrid",
	__ssrInlineRender: true,
	props: {
		size: {
			type: String,
			required: false,
			default: "medium"
		},
		data: {
			type: Array,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const el = useTemplateRef("el");
		useSponsorsGrid({
			el,
			size: props.size
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<ul${ssrRenderAttrs(mergeProps({
				class: ["VPSponsorsGrid vp-sponsor-grid", [__props.size]],
				ref_key: "el",
				ref: el
			}, _attrs))}><!--[-->`);
			ssrRenderList(__props.data, (sponsor) => {
				_push(`<li class="vp-sponsor-grid-item"><a class="vp-sponsor-grid-link"${ssrRenderAttr("href", sponsor.url)} target="_blank" rel="sponsored noopener"><article class="vp-sponsor-grid-box"><img class="vp-sponsor-grid-image"${ssrRenderAttr("src", sponsor.img)}${ssrRenderAttr("alt", sponsor.name)}></article></a></li>`);
			});
			_push(`<!--]--></ul>`);
		};
	}
};
var _sfc_setup$18 = _sfc_main$18.setup;
_sfc_main$18.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue");
	return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue
var _sfc_main$17 = {
	__name: "VPSponsors",
	__ssrInlineRender: true,
	props: {
		mode: {
			type: String,
			required: false,
			default: "normal"
		},
		tier: {
			type: String,
			required: false
		},
		size: {
			type: String,
			required: false
		},
		data: {
			type: Array,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const sponsors = computed(() => {
			if (props.data.some((s) => {
				return "items" in s;
			})) return props.data;
			return [{
				tier: props.tier,
				size: props.size,
				items: props.data
			}];
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPSponsors vp-sponsor", [__props.mode]] }, _attrs))}><!--[-->`);
			ssrRenderList(sponsors.value, (sponsor, index) => {
				_push(`<section class="vp-sponsor-section">`);
				if (sponsor.tier) _push(`<h3 class="vp-sponsor-tier">${ssrInterpolate(sponsor.tier)}</h3>`);
				else _push(`<!---->`);
				_push(ssrRenderComponent(_sfc_main$18, {
					size: sponsor.size,
					data: sponsor.items
				}, null, _parent));
				_push(`</section>`);
			});
			_push(`<!--]--></div>`);
		};
	}
};
var _sfc_setup$17 = _sfc_main$17.setup;
_sfc_main$17.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue");
	return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue
var _sfc_main$16 = {
	__name: "VPDocAsideSponsors",
	__ssrInlineRender: true,
	props: {
		tier: {
			type: String,
			required: false
		},
		size: {
			type: String,
			required: false
		},
		data: {
			type: Array,
			required: true
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAsideSponsors" }, _attrs))}>`);
			_push(ssrRenderComponent(_sfc_main$17, {
				mode: "aside",
				tier: __props.tier,
				size: __props.size,
				data: __props.data
			}, null, _parent));
			_push(`</div>`);
		};
	}
};
var _sfc_setup$16 = _sfc_main$16.setup;
_sfc_main$16.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue");
	return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue
var _sfc_main$15 = {
	__name: "VPHomeSponsors",
	__ssrInlineRender: true,
	props: {
		message: {
			type: String,
			required: false
		},
		actionText: {
			type: String,
			required: false,
			default: "Become a sponsor"
		},
		actionLink: {
			type: String,
			required: false
		},
		data: {
			type: Array,
			required: true
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<section${ssrRenderAttrs(mergeProps({ class: "VPHomeSponsors" }, _attrs))} data-v-85d036f9><div class="container" data-v-85d036f9><div class="header" data-v-85d036f9><div class="love" data-v-85d036f9><span class="vpi-heart icon" data-v-85d036f9></span></div>`);
			if (__props.message) _push(`<h2 class="message" data-v-85d036f9>${ssrInterpolate(__props.message)}</h2>`);
			else _push(`<!---->`);
			_push(`</div><div class="sponsors" data-v-85d036f9>`);
			_push(ssrRenderComponent(_sfc_main$17, { data: __props.data }, null, _parent));
			_push(`</div>`);
			if (__props.actionLink) {
				_push(`<div class="action" data-v-85d036f9>`);
				_push(ssrRenderComponent(VPButton_default, {
					theme: "sponsor",
					text: __props.actionText,
					href: __props.actionLink
				}, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div></section>`);
		};
	}
};
var _sfc_setup$15 = _sfc_main$15.setup;
_sfc_main$15.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue");
	return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue
var _sfc_main$14 = {
	__name: "VPTeamMembersItem",
	__ssrInlineRender: true,
	props: {
		size: {
			type: String,
			required: false,
			default: "medium"
		},
		member: {
			type: Object,
			required: true
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<article${ssrRenderAttrs(mergeProps({ class: ["VPTeamMembersItem", [__props.size]] }, _attrs))} data-v-a86b850f><div class="profile" data-v-a86b850f><figure class="avatar" data-v-a86b850f><img class="avatar-img"${ssrRenderAttr("src", __props.member.avatar)}${ssrRenderAttr("alt", __props.member.name)} data-v-a86b850f></figure><div class="data" data-v-a86b850f><h1 class="name" data-v-a86b850f>${ssrInterpolate(__props.member.name)}</h1>`);
			if (__props.member.title || __props.member.org) {
				_push(`<p class="affiliation" data-v-a86b850f>`);
				if (__props.member.title) _push(`<span class="title" data-v-a86b850f>${ssrInterpolate(__props.member.title)}</span>`);
				else _push(`<!---->`);
				if (__props.member.title && __props.member.org) _push(`<span class="at" data-v-a86b850f> @ </span>`);
				else _push(`<!---->`);
				if (__props.member.org) _push(ssrRenderComponent(_sfc_main$64, {
					class: ["org", { link: __props.member.orgLink }],
					href: __props.member.orgLink,
					"no-icon": ""
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`${ssrInterpolate(__props.member.org)}`);
						else return [createTextVNode(toDisplayString(__props.member.org), 1)];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(`</p>`);
			} else _push(`<!---->`);
			if (__props.member.desc) _push(`<p class="desc" data-v-a86b850f>${__props.member.desc ?? ""}</p>`);
			else _push(`<!---->`);
			if (__props.member.links) {
				_push(`<div class="links" data-v-a86b850f>`);
				_push(ssrRenderComponent(VPSocialLinks_default, {
					links: __props.member.links,
					me: false
				}, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
			if (__props.member.sponsor) {
				_push(`<div class="sp" data-v-a86b850f>`);
				_push(ssrRenderComponent(_sfc_main$64, {
					class: "sp-link",
					href: __props.member.sponsor,
					"no-icon": ""
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<span class="vpi-heart sp-icon" data-v-a86b850f${_scopeId}></span> ${ssrInterpolate(__props.member.actionText || "Sponsor")}`);
						else return [createVNode("span", { class: "vpi-heart sp-icon" }), createTextVNode(" " + toDisplayString(__props.member.actionText || "Sponsor"), 1)];
					}),
					_: 1
				}, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</article>`);
		};
	}
};
var _sfc_setup$14 = _sfc_main$14.setup;
_sfc_main$14.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
var VPTeamMembersItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$14, [["__scopeId", "data-v-a86b850f"]]);
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue
var _sfc_main$13 = {
	__name: "VPTeamMembers",
	__ssrInlineRender: true,
	props: {
		size: {
			type: String,
			required: false,
			default: "medium"
		},
		members: {
			type: Array,
			required: true
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPTeamMembers", [__props.size, `count-${__props.members.length}`]] }, _attrs))} data-v-ab8819d9><ul class="container" data-v-ab8819d9><!--[-->`);
			ssrRenderList(__props.members, (member) => {
				_push(`<li class="item" data-v-ab8819d9>`);
				_push(ssrRenderComponent(VPTeamMembersItem_default, {
					size: __props.size,
					member
				}, null, _parent));
				_push(`</li>`);
			});
			_push(`<!--]--></ul></div>`);
		};
	}
};
var _sfc_setup$13 = _sfc_main$13.setup;
_sfc_main$13.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPTeamPage.vue
var _sfc_main$12 = {};
var _sfc_setup$12 = _sfc_main$12.setup;
_sfc_main$12.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPTeamPage.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPTeamPageSection.vue
var _sfc_main$11 = {};
var _sfc_setup$11 = _sfc_main$11.setup;
_sfc_main$11.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPTeamPageSection.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/components/VPTeamPageTitle.vue
var _sfc_main$10 = {};
var _sfc_setup$10 = _sfc_main$10.setup;
_sfc_main$10.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/vitepress/dist/client/theme-default/components/VPTeamPageTitle.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
//#endregion
//#region node_modules/vitepress/dist/client/theme-default/without-fonts.js
var theme = {
	Layout: Layout_default,
	enhanceApp: ({ app }) => {
		app.component("Badge", _sfc_main$72);
	}
};
//#endregion
//#region .vitepress/theme/posts.data.js
var data = JSON.parse("[{\"url\":\"/articles/life/parenting/child_medic.html\",\"title\":\"家庭用药与孕妇、婴儿注意事项\",\"description\":\"介绍家庭常用药，以及孕妇能否使用，婴幼儿能否使用。\",\"category\":\"生活指南\",\"tags\":[\"养娃记录\",\"健康\",\"家庭\"],\"date\":\"2026-09-20\",\"ts\":1789862400000,\"excerpt\":\"<div class=\\\"caution custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">CAUTION</p>\\n<p>本文仅为家庭用药科普整理，不构成医疗建议。用药前请务必核对药品说明书，孕妇、婴幼儿及慢性病患者用药须先咨询医生或药师。</p>\\n</div>\\n<h2 id=\\\"一、用药总原则\\\" tabindex=\\\"-1\\\">一、用药总原则 <a class=\\\"header-anchor\\\" href=\\\"#一、用药总原则\\\" aria-label=\\\"Permalink to “一、用药总原则”\\\">&#8203;</a></h2>\\n<ol>\\n<li><strong>能不用就不用</strong>：普通感冒、轻微腹泻多数可自愈，优先多休息、多喝水、清淡饮食。</li>\\n<li><strong>成分优先于商品名</strong>：复方感冒药常含多种成分，看清成分表，避免重复用药。</li>\\n<li><strong>孕期与婴幼儿是特殊人群</strong>：任何用药前先确认&quot;孕妇/婴幼儿是否可用、剂量多少&quot;。</li>\\n<li><strong>婴幼儿按体重给药</strong>：剂量以公斤体重计算，不是按年龄估；不同剂型（滴剂/混悬液/片剂）浓度不同，切勿混用。</li>\\n<li><strong>不自行用抗生素</strong>：抗生素只对细菌有效，需医生处方，滥用有害。</li>\\n</ol>\\n\"},{\"url\":\"/articles/notes/website/to_vitepress.html\",\"title\":\"迁移至Vitepress，构建文档库类型的博客\",\"description\":\"收集碎片化文章，形成树状专题。\",\"category\":\"随笔\",\"tags\":[\"建站笔记\",\"AI\"],\"date\":\"2026-09-19\",\"ts\":1789776000000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/firm/huojianhuishou.html\",\"title\":\"中美火箭回收有何异同\",\"description\":\"SpaceX目前有两款型号，一个是成熟运行10年的猎鹰9号；一个是试验阶段的星舰。中国目前测试成功的型号是长征十号-乙。本文列举三者的参数。\",\"category\":\"置身事内\",\"tags\":[\"企业观察\"],\"date\":\"2026-07-12\",\"ts\":1783814400000,\"excerpt\":\"<h2 id=\\\"火箭回收方案对比\\\" tabindex=\\\"-1\\\">火箭回收方案对比 <a class=\\\"header-anchor\\\" href=\\\"#火箭回收方案对比\\\" aria-label=\\\"Permalink to “火箭回收方案对比”\\\">&#8203;</a></h2>\\n<p>博主整理，如有错误，欢迎指正。</p>\\n<p>|              | 猎鹰9 (Falcon 9)             | 星舰 (Starship)            | 长征十号乙 (CZ-10B)            |\\n|</p>\\n\"},{\"url\":\"/articles/zstn/macro/cijixiaofei.html\",\"title\":\"怎么刺激消费和房价，韩国已经把答案贴在脸上了\",\"description\":\"做大蛋糕与分好蛋糕同样重要\",\"category\":\"置身事内\",\"tags\":[\"宏观观察\"],\"date\":\"2026-06-21\",\"ts\":1782000000000,\"excerpt\":\"<h2 id=\\\"全球化产业收入-做大蛋糕\\\" tabindex=\\\"-1\\\">全球化产业收入（做大蛋糕） <a class=\\\"header-anchor\\\" href=\\\"#全球化产业收入-做大蛋糕\\\" aria-label=\\\"Permalink to “全球化产业收入（做大蛋糕）”\\\">&#8203;</a></h2>\\n<p>SK海力士是韩国的半导体供应商，为全球客户提供DRAM（动态随机存取存储器）和NAND Flash（NAND快闪存储器）等半导体产品。其2026 Q1财报非常炸裂：</p>\\n<p><img src=\\\"https://static.wyclab.com/skq1260621.png\\\" alt=\\\"skq1\\\"></p>\\n<p>2026年一季度的净利润达到1786亿元人民币，投行预测2026全年利润1.16万亿人民币。</p>\\n<p>这可太牛了，目前没有任何一家中国上市公司，单年净利润达到这个级别，宇宙行工商银行2025年净利润也才约3686亿元，千亿利润的中国公司已经是凤毛麟角！而SK海力士一家的年利润，就足以装下接近三个工行。</p>\\n<p>| 排名 | 代码   | 简称     | 2025年归母净利润（亿元） |\\n|</p>\\n\"},{\"url\":\"/articles/ai/ai-tech/gemma4-12b.html\",\"title\":\"Gemma4-12B本地部署\",\"description\":\"Gemma4-12B 依托于强大的 120 亿参数模型，它在本地环境中即可流畅运行。处理敏感隐私文档、进行长篇逻辑推理，还能作为你的全天候创作伙伴\",\"category\":\"AI世界\",\"tags\":[\"AI技术\"],\"date\":\"2026-06-07\",\"ts\":1780790400000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/basics/GI.html\",\"title\":\"GI与GL\",\"description\":\"了解食物的GI与GL水平，保持血糖稳定\",\"category\":\"健康健身\",\"tags\":[\"基础知识\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<p>GI 值反映了含有碳水化合物的食物在进食后，引起血糖上升的速度和能力。</p>\\n<p><strong>高 GI（≥ 70）：</strong> 进入胃肠后消化快、吸收率高，葡萄糖迅速进入血液，导致血糖出现明显峰值。</p>\\n<p><strong>中 GI（56 - 69）：</strong> 消化和吸收速度适中，对血糖的影响介于高低之间。</p>\\n<p><strong>低 GI（≤ 55）：</strong> 在胃肠中停留时间长，吸收率低，葡萄糖释放缓慢，血糖升降平稳。</p>\\n<p>| <strong>分类</strong>        | <strong>食物名称</strong>        | <strong>GI 值</strong> | <strong>消化与血糖特点</strong>                           |\\n|</p>\\n\"},{\"url\":\"/articles/fitness/basics/health-indicators.html\",\"title\":\"健康指标\",\"description\":\"健康指标\",\"category\":\"健康健身\",\"tags\":[\"基础知识\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<h2 id=\\\"与运动水平相关的指标\\\" tabindex=\\\"-1\\\">与运动水平相关的指标 <a class=\\\"header-anchor\\\" href=\\\"#与运动水平相关的指标\\\" aria-label=\\\"Permalink to “与运动水平相关的指标”\\\">&#8203;</a></h2>\\n<p>有氧适能</p>\\n<p>血氧饱和度</p>\\n<p>有氧恢复</p>\\n<h2 id=\\\"与心率有关的指标\\\" tabindex=\\\"-1\\\">与心率有关的指标 <a class=\\\"header-anchor\\\" href=\\\"#与心率有关的指标\\\" aria-label=\\\"Permalink to “与心率有关的指标”\\\">&#8203;</a></h2>\\n<p>心率变异性</p>\\n<h2 id=\\\"与体重相关的指标\\\" tabindex=\\\"-1\\\">与体重相关的指标 <a class=\\\"header-anchor\\\" href=\\\"#与体重相关的指标\\\" aria-label=\\\"Permalink to “与体重相关的指标”\\\">&#8203;</a></h2>\\n<p>体脂率</p>\\n<h2 id=\\\"睡眠\\\" tabindex=\\\"-1\\\">睡眠 <a class=\\\"header-anchor\\\" href=\\\"#睡眠\\\" aria-label=\\\"Permalink to “睡眠”\\\">&#8203;</a></h2>\\n<p>睡眠时长</p>\\n<p>有氧适能（Cardiorespiratory Fitness, CRF），也称为心肺适能或有氧耐力，是指人体通过心肺系统和肌肉系统协同工作，在持续身体活动中高效摄取、运输和利用氧气的能力。它是衡量整体健康和运动能力的重要指标。</p>\\n\"},{\"url\":\"/articles/fitness/basics/hormone.html\",\"title\":\"内分泌必读基础\",\"description\":\"了解基础的内分泌知识\",\"category\":\"健康健身\",\"tags\":[\"基础知识\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/basics/organ.html\",\"title\":\"器官健康\",\"description\":\"器官基本知识\",\"category\":\"健康健身\",\"tags\":[\"基础知识\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/basics/sleep.html\",\"title\":\"睡眠\",\"description\":\"睡眠是身体的基础\",\"category\":\"健康健身\",\"tags\":[\"基础知识\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/basics/supplement.html\",\"title\":\"补剂\",\"description\":\"合理补充\",\"category\":\"健康健身\",\"tags\":[\"基础知识\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<h2 id=\\\"肌酸-creatine\\\" tabindex=\\\"-1\\\">肌酸（Creatine） <a class=\\\"header-anchor\\\" href=\\\"#肌酸-creatine\\\" aria-label=\\\"Permalink to “肌酸（Creatine）”\\\">&#8203;</a></h2>\\n<p>肌酸（Creatine）是健身界研究最透彻、公认最安全且有效的补剂之一。对于健身人士来说，它是一个非常优秀的“辅助工具”，但并非绝对的“必需品”。</p>\\n<p>简单来说，肌酸是你肌肉的“备用电池”。</p>\\n<p>人体在进行高强度、爆发性运动时，主要依靠ATP（三磷酸腺苷）来提供能量。但肌肉中储存的ATP非常少，几秒钟就会耗尽。肌酸在体内会转化为磷酸肌酸，它的核心作用就是<strong>快速重新合成ATP</strong>，让你的肌肉能持续输出能量。</p>\\n<p>人体自身（肝脏、肾脏）每天能合成大约1-2克肌酸，日常饮食中的红肉和鱼类也会提供一定量的肌酸，这足以应付日常生活的能量需求。</p>\\n<p>| <strong>食物来源 (生鲜状态)</strong>  | <strong>近似肌酸含量 (克 / 每公斤)</strong> |\\n|</p>\\n\"},{\"url\":\"/articles/fitness/functional/Fascia.html\",\"title\":\"筋膜\",\"description\":\"筋膜放松\",\"category\":\"健康健身\",\"tags\":[\"功能训练\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/functional/tuoyuanyi.html\",\"title\":\"椭圆仪（有氧）\",\"description\":\"椭圆仪使用指南\",\"category\":\"健康健身\",\"tags\":[\"功能训练\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/posture/posture.html\",\"title\":\"体态\",\"description\":\"保持日常体态\",\"category\":\"健康健身\",\"tags\":[\"日常体态\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/strength/RM.html\",\"title\":\"RM选择\",\"description\":\"选择合适的重量\",\"category\":\"健康健身\",\"tags\":[\"力量训练\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/strength/overview.html\",\"title\":\"肌群概览\",\"description\":\"认识全身的肌群\",\"category\":\"健康健身\",\"tags\":[\"力量训练\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/fitness/strength/start.html\",\"title\":\"动作指引\",\"description\":\"力量训练入门与动作指引\",\"category\":\"健康健身\",\"tags\":[\"力量训练\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/invest/basics/meigu.html\",\"title\":\"美股\",\"description\":\"美股是投资必备的标的\",\"category\":\"投资笔记\",\"tags\":[\"基础知识\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/invest/basics/yuanyoubao.html\",\"title\":\"原油宝\",\"description\":\"中国银行\",\"category\":\"投资笔记\",\"tags\":[\"基础知识\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/life/beijing/BJyibao.html\",\"title\":\"北京医保\",\"description\":\"北京医保报销制度\",\"category\":\"生活指南\",\"tags\":[\"北京通\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<p>目前，北京市基本医疗保险制度包括两种类型，即：城镇职工基本医疗保险制度（简称城镇职工医保）和城乡居民基本医疗保险制度（简称城乡居民医保），两项基本医疗保险制度覆盖了北京市全体城镇职工和城乡居民。</p>\\n<p>基本医疗保险待遇包括：门（急）诊待遇和住院类待遇，两者分别设置了起付标准、支付比例、最高支付限额。</p>\\n<p>（一）起付标准</p>\\n<p>起付标准也称“起付线”，是指参保人员在享受医疗费用报销之前需要自己先行支付的费用额度。</p>\\n<p>（二）支付比例</p>\\n<p>支付比例是指起付标准以上至最高支付限额以下，医保基金对参保人员医疗费用的报销比例。</p>\\n<p>（三）最高支付限额</p>\\n<p>最高支付限额也称“封顶线”，是指基本医疗保险基金支付参保人员医疗费用的上限。超出最高支付限额以上的医疗费用，基本医疗保险基金不再支付。</p>\\n<h3 id=\\\"北京市城镇职工基本医疗保险待遇\\\" tabindex=\\\"-1\\\">北京市城镇职工基本医疗保险待遇 <a class=\\\"header-anchor\\\" href=\\\"#北京市城镇职工基本医疗保险待遇\\\" aria-label=\\\"Permalink to “北京市城镇职工基本医疗保险待遇”\\\">&#8203;</a></h3>\\n<p>目前，本市在职职工医院门（急）诊报销比例达到70%，退休人员达到85%，社区卫生机构报销比例均为90%，门诊报销2万元以上，再发生医疗费用，在职职工报销60%、退休人员报销80%，上不封顶。</p>\\n<p>本市在职职工住院报销比例在85%以上，退休人员住院报销比例在90%以上，最高可达99.1%，住院封顶线为50万元。</p>\\n<p><img src=\\\"/images/image-20260215172836285.png\\\" alt=\\\"image-20260215172836285\\\" width=\\\"1080\\\" height=\\\"576\\\"></p>\\n<p><img src=\\\"/images/image-20260215172843192.png\\\" alt=\\\"image-20260215172843192\\\" width=\\\"1080\\\" height=\\\"496\\\"></p>\\n<h3 id=\\\"北京市城乡居民基本医疗保险待遇\\\" tabindex=\\\"-1\\\">北京市城乡居民基本医疗保险待遇 <a class=\\\"header-anchor\\\" href=\\\"#北京市城乡居民基本医疗保险待遇\\\" aria-label=\\\"Permalink to “北京市城乡居民基本医疗保险待遇”\\\">&#8203;</a></h3>\\n<p>目前，城乡居民参保人员的门（急）诊封顶线5000元，住院封顶线为25万元。</p>\\n<p><img src=\\\"/images/image-20260215172849821.png\\\" alt=\\\"image-20260215172849821\\\" width=\\\"1080\\\" height=\\\"423\\\"></p>\\n<p>注：①上表住院起付线特指本年度首次住院，老年人和劳动年龄内居民本年度第二次及以后住院，起付线减半。</p>\\n<p>②学生儿童的住院起付线均减半。</p>\\n<p>③区属三级定点医院住院报销比例为78%。</p>\\n\"},{\"url\":\"/articles/life/beijing/car.html\",\"title\":\"北京小客车\",\"description\":\"北京小客车指标数据一览\",\"category\":\"生活指南\",\"tags\":[\"北京通\",\"汽车\",\"生活\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<h2 id=\\\"汽车指标\\\" tabindex=\\\"-1\\\">汽车指标 <a class=\\\"header-anchor\\\" href=\\\"#汽车指标\\\" aria-label=\\\"Permalink to “汽车指标”\\\">&#8203;</a></h2>\\n<h3 id=\\\"发展历程\\\" tabindex=\\\"-1\\\">发展历程 <a class=\\\"header-anchor\\\" href=\\\"#发展历程\\\" aria-label=\\\"Permalink to “发展历程”\\\">&#8203;</a></h3>\\n<p>2011年普通指标（蓝牌油车）开始摇号。</p>\\n<p>2014 年设置新能源指标，<strong>单独摇号池</strong>；2014-2015年新能源指标申请人数小于指标数，买车就能上牌。2016年，新能源改为排队。2018年排队人数大大增加。</p>\\n<p>2021年，引入了以“无车家庭”为单位的积分排序与摇号配置方式。指标向无车家庭倾斜，个人拿指标的难度增大。</p>\\n<p>2024-2026年，连续三年增发新能源指标，大幅降低无车家庭的入围分数。</p>\\n<h3 id=\\\"历年指标情况\\\" tabindex=\\\"-1\\\">历年指标情况 <a class=\\\"header-anchor\\\" href=\\\"#历年指标情况\\\" aria-label=\\\"Permalink to “历年指标情况”\\\">&#8203;</a></h3>\\n<div class=\\\"warning custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">WARNING</p>\\n<p>数据由豆包整理，如有错误欢迎评论区勘误。</p>\\n</div>\\n<h4 id=\\\"普通小客车指标-蓝牌\\\" tabindex=\\\"-1\\\">普通小客车指标（蓝牌） <a class=\\\"header-anchor\\\" href=\\\"#普通小客车指标-蓝牌\\\" aria-label=\\\"Permalink to “普通小客车指标（蓝牌）”\\\">&#8203;</a></h4>\\n<p>| 年份 | 年度个人指标配额 (个) | 家庭指标 | 年度个人综合平均中签率 | 备注                                   |\\n|</p>\\n\"},{\"url\":\"/articles/life/beijing/fuchan.html\",\"title\":\"北京产科\",\"description\":\"北京产科医院介绍\",\"category\":\"生活指南\",\"tags\":[\"北京通\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<p>北京有产科的三甲医院总计 27 家</p>\\n<h2 id=\\\"一、产科国际部-独立院区-楼层-全高端服务\\\" tabindex=\\\"-1\\\">一、产科国际部（独立院区 / 楼层，全高端服务） <a class=\\\"header-anchor\\\" href=\\\"#一、产科国际部-独立院区-楼层-全高端服务\\\" aria-label=\\\"Permalink to “一、产科国际部（独立院区 / 楼层，全高端服务）”\\\">&#8203;</a></h2>\\n<p>| 医院名称             | 院区            | 单人病房情况                                                 | 费用区间（全程）                                             | 核心特点                                                     |\\n|</p>\\n\"},{\"url\":\"/articles/life/life-plan/keypoint.html\",\"title\":\"人生目标\",\"description\":\"人一生只有一个主线任务\",\"category\":\"生活指南\",\"tags\":[\"人生主线\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/life/life-plan/management.html\",\"title\":\"管理艺术\",\"description\":\"management\",\"category\":\"生活指南\",\"tags\":[\"人生主线\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/life/parenting/pregnant.html\",\"title\":\"怀孕记录\",\"description\":\"怀孕期间的注意事项\",\"category\":\"生活指南\",\"tags\":[\"养娃记录\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<div class=\\\"caution custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">CAUTION</p>\\n<p>本文不构成医疗建议。</p>\\n</div>\\n<p>孕周的计算：从末次月经数开始计算孕周，40周后为预产期。这表示这40周中包含月经期，而实际上你的身体还没有真正怀孕。通常真正的怀孕发生在末次月经开始后的两周。</p>\\n<h2 id=\\\"一、-孕六周抓紧时间建档\\\" tabindex=\\\"-1\\\">一、 孕六周抓紧时间建档 <a class=\\\"header-anchor\\\" href=\\\"#一、-孕六周抓紧时间建档\\\" aria-label=\\\"Permalink to “一、 孕六周抓紧时间建档”\\\">&#8203;</a></h2>\\n<p>因为医院的床位有限，通常会根据建档时间锁定远期的床位。分为“社区建册”和“医院建档”两步。</p>\\n<ol>\\n<li>\\n<p><strong>办理《北京市母子健康档案》（社区建册）：</strong> 通常在孕满6周（按末次月经第一天计算）后，在孕妇户口所在地或居住地所属的社区卫生服务中心申请建册。提供夫妻双方身份证、结婚证、户口本（或北京市居住证）、医院出具的怀孕证明（血HCG或B超单）。</p>\\n<div class=\\\"tip custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">TIP</p>\\n</div>\\n</li>\\n</ol>\\n<p>社区建册可以线上办理。\\n:::</p>\\n<ol start=\\\"2\\\">\\n<li>\\n<p><strong>医院建档：</strong>由于北京三甲医院（如北医三院、北京妇产医院）产科床位紧张，建议确认怀孕后立刻了解心仪医院的建档名额和要求。 携带《母子健康手册》、医院要求的检查单（如B超单、艾梅乙筛查等）到医院产科办理预约建档。</p>\\n<p><a href=\\\"/docs/bjtown/fuchan.html\\\">北京医院建档参考</a></p>\\n</li>\\n</ol>\\n<h2 id=\\\"二、-孕周概览\\\" tabindex=\\\"-1\\\">二、 孕周概览 <a class=\\\"header-anchor\\\" href=\\\"#二、-孕周概览\\\" aria-label=\\\"Permalink to “二、 孕周概览”\\\">&#8203;</a></h2>\\n<p><img src=\\\"/images/image-20260606214145896.png\\\" alt=\\\"image-20260606214145896\\\" width=\\\"986\\\" height=\\\"216\\\"></p>\\n<div class=\\\"caution custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">CAUTION</p>\\n<p>早期流产常常与染色体异常或其他胎儿生长问题有关——与你做了什么或没做什么基本不相关。</p>\\n</div>\\n<h2 id=\\\"三、-孕早期的反应\\\" tabindex=\\\"-1\\\">三、 孕早期的反应 <a class=\\\"header-anchor\\\" href=\\\"#三、-孕早期的反应\\\" aria-label=\\\"Permalink to “三、 孕早期的反应”\\\">&#8203;</a></h2>\\n<p>早孕反应会影响50%～80%的孕妇，典型的症状和体征出现在孕5～8周，有时从受孕第2周就会开始出现症状。通常在怀孕13～14周前就会减弱。通常早孕反应不需要治疗，但在家里的一些调养方法，如少食多餐、少量饮用一些姜茶可以帮助缓解恶心的症状。非常罕见的，有时非常重症的早孕反应，分级为妊娠剧吐，可能需要住院静脉补液和用药治疗。</p>\\n<div class=\\\"tip custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">TIP</p>\\n<p>缓解孕吐：\\n选择低油脂的食物-选择那些温和干燥、容易消化和脂肪含量低的食物\\n多吃零食、少食多餐-早晨起床之前，可以吃一些苏打饼干或者一片烤面包片。全天少食多餐，而不仅限于一日三餐。胃中过空可能会加重恶心症状。\\n保持通风-保持室内通风良好，别有烹饪的气味。尽量呼吸新鲜空气。</p>\\n</div>\\n<div class=\\\"caution custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">CAUTION</p>\\n<p>怀孕的第三个月是孕早期的最后一个月。一些孕早期的不舒服和令人不安的事，如晨吐、疲劳、尿频等，这个月将尤其严重</p>\\n</div>\\n<p>第3个月，由于子宫体积不断增大，并且更靠近膀胱，你可能会因尿频而需要经常小便。在这个月末之前，你的子宫会长出盆腔，膀胱的压迫症状就会有所好转。</p>\\n<p>在最初的12周时间里，因怀孕需求巨大，你的循环血容量增长迅速。到怀孕晚期，血容量将比孕前增长30%～50%。为了适应血流的增加，你的心脏泵血将更加有力和快速，脉搏可能每分钟增加多达15次。这些改变是你孕早期感觉疲惫的重要原因。你可能在晚饭后就想要上床睡觉，或者觉得在白天需要小憩一下。</p>\\n<h2 id=\\\"四、核心孕检项目\\\" tabindex=\\\"-1\\\">四、核心孕检项目 <a class=\\\"header-anchor\\\" href=\\\"#四、核心孕检项目\\\" aria-label=\\\"Permalink to “四、核心孕检项目”\\\">&#8203;</a></h2>\\n<p>建档后，需按医生嘱咐定期进行产检。以下为常规核心产检项目：</p>\\n<p>| 孕周          | 核心检查项目                         | 检查目的                                           |\\n| :</p>\\n\"},{\"url\":\"/articles/life/productivity/windows_software.html\",\"title\":\"必备软件\",\"description\":\"windows必备\",\"category\":\"生活指南\",\"tags\":[\"生产力\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/life/smart-life/network.html\",\"title\":\"家庭网络\",\"description\":\"家用网络指南\",\"category\":\"生活指南\",\"tags\":[\"智能生活\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<h2 id=\\\"一、光纤接入\\\" tabindex=\\\"-1\\\">一、光纤接入 <a class=\\\"header-anchor\\\" href=\\\"#一、光纤接入\\\" aria-label=\\\"Permalink to “一、光纤接入”\\\">&#8203;</a></h2>\\n<p>先普及几个网络带宽的基础知识。</p>\\n<h3 id=\\\"百兆带宽、千兆带宽是什么意思\\\" tabindex=\\\"-1\\\">百兆带宽、千兆带宽是什么意思 <a class=\\\"header-anchor\\\" href=\\\"#百兆带宽、千兆带宽是什么意思\\\" aria-label=\\\"Permalink to “百兆带宽、千兆带宽是什么意思”\\\">&#8203;</a></h3>\\n<p>Mbps = 带宽单位（运营商说的带宽），MB/s = 下载速度单位（你看到的下载速率）。两者的换算关系如下：1 MB/s ≈ 8 Mbps。千兆带宽大约能实现120MB/s的下载速度，百兆带宽能实现60MB/S的下载速度。</p>\\n<p><strong>带宽大很鸡肋。</strong>带宽大只能说明下载快，千兆带宽下载100GB游戏仅需要15分钟。但目前网络生态，需要下载的环境越来越少。就算喜欢玩3A大作，也不可能每天都下载游戏，而游戏运行时主要运算都在本地，需要与服务器交换的数据极少。而且最关键的是：云端不会给你这么大的带宽，以百度云网盘为例，不开会员就是0.1MB/s，你家的带宽多大都没用，开了会员也很少能跑到50MB/s以上（对应500M带宽）。实际上，对于普通个人/家庭用户，300M宽带足矣。以对带宽需求最高的直播/流媒体播放为例，目前国内的伪4K直播大约需要占用30M带宽（大约3-4MB/S），300M带宽足以满足家庭六人的网络需求。</p>\\n<p><strong>对于游戏党而言，更重要的是延迟、而不是带宽。</strong> 影响延迟的很多因素是不可控的，比如地理位置、小区的基础设施、运营商对本区域的整体接入带宽和设备情况。在家庭范围内，优化延迟能做的很少：（1）选运营商；（2）选路由器；（3）优化家庭网络布局，PC电脑优先以网线接入，手机等移动设备与WIFI路由器距离要近、不能隔墙。</p>\\n<p><strong>另外需要是否有上行带宽需求。</strong>目前运营商宣称的都是下行带宽，而上行带宽一般都很小，通常在30MB至50M之间。上行带宽决定上传的速度，例如手机相册上传到百度云盘的速度。对于普通用户这个上行带宽是足够的。</p>\\n<div class=\\\"tip custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">TIP</p>\\n<p>综上，选择网络的核心是：带宽够用即可，延迟越低越好。</p>\\n</div>\\n<h3 id=\\\"水管理论\\\" tabindex=\\\"-1\\\">水管理论 <a class=\\\"header-anchor\\\" href=\\\"#水管理论\\\" aria-label=\\\"Permalink to “水管理论”\\\">&#8203;</a></h3>\\n<p>网络传输是典型的水管理论，流量的大小，取决于：</p>\\n<ul>\\n<li>服务商（供水）</li>\\n<li>宽带商（入户水网）</li>\\n<li>家里的路由器、网线、交换机等（水管）</li>\\n</ul>\\n<p>如果是千兆以上带宽，需要格外注意以下几个方面</p>\\n<ul>\\n<li>宽带商的光猫是否有千兆接口甚至2.5Gbps接口（2.5Gbps简称2.5G，等于2500Mbps）</li>\\n<li>预留的网口和网线是否为千兆级别。网线的标准如下——超五类（CAT5e）：标准支持千兆，短距离可跑 2.5G ；六类（CAT6）：稳定千兆，轻松 2.5G/5G，家装最优。</li>\\n<li>不仅网线要买“六类（CAT6）”或“超六类（CAT6A）”，墙壁暗盒里的<strong>模块</strong>和水晶头也必须购买对应六类及以上等级的产品。网口（RJ45网络接头）需要盯着师傅压线，必须**8 **根铜芯全部导通，8 根全部压好、通断正常：才能协商 1G/2.5G。</li>\\n<li>无线路由器支持5Ghz（赫兹）</li>\\n</ul>\\n<p><img src=\\\"https://static.wyclab.com/rj45260620.png\\\" alt=\\\"rj45\\\"></p>\\n<h3 id=\\\"装修预留网线接口\\\" tabindex=\\\"-1\\\">装修预留网线接口 <a class=\\\"header-anchor\\\" href=\\\"#装修预留网线接口\\\" aria-label=\\\"Permalink to “装修预留网线接口”\\\">&#8203;</a></h3>\\n<p>一般光纤是从“弱电箱”中接入，光猫直接放在弱电箱中。从弱电箱到每个房间都可以预留网线。其中书房（台式电脑）、客厅（电视）一定预留网线接口。客厅接口最好预留3路，其中一路用于iptv，其余两路用于Mesh组网。当然，最新有的路由器是支持iptv中继的。</p>\\n<p>预留的网口可以用于台式机等设备的有线连接（有线连接的稳定性高于无线网），也可以用于下一节介绍的家庭组网，用于连接智能设备和手机、PAD等移动设备。</p>\\n<h2 id=\\\"三、家庭mesh组网-无线局域网\\\" tabindex=\\\"-1\\\">三、家庭Mesh组网（无线局域网） <a class=\\\"header-anchor\\\" href=\\\"#三、家庭mesh组网-无线局域网\\\" aria-label=\\\"Permalink to “三、家庭Mesh组网（无线局域网）”\\\">&#8203;</a></h2>\\n<p>目前运营商提供的路由器兼具了“光猫”和“无线路由器”的功能，对于60平米以下小户型覆盖绰绰有余。但是对于覆盖全屋仍有一些吃力。这就需要全屋组网。在这里推荐有线Mesh组网，是最适合家庭的方案。其他AC+AP，FTTR方案要么比较昂贵，要么不够灵活。</p>\\n<p><img src=\\\"https://static.wyclab.com/image-20260620114124192260620.png\\\" alt=\\\"image-20260620114124192\\\"></p>\\n<p>主路由和子路由通常需要为同一品牌，标注支持Mesh组网即可。</p>\\n<p>主路由的位置：可以直接放在弱电箱，也可以放在客厅（家里的中央位置）</p>\\n<p>子路由的位置：可以根据自己家的户型图和卧室位置使用。</p>\\n<p>主路由器和副路由器的连接依靠的是装修预留的网口和预埋的网线。</p>\\n<p>对于一个传统的四叶草户型，一个主路由器放南侧中央客厅，一个副路由器放北侧中间书房即可满足需求。</p>\\n<div class=\\\"tip custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">TIP</p>\\n<p>家里面积比较大，主路由的网口不够的话，可以在主路由中接<code>交换机</code>拓展接口。</p>\\n</div>\\n<h3 id=\\\"路由器局域网的5g是什么\\\" tabindex=\\\"-1\\\">路由器局域网的5G是什么 <a class=\\\"header-anchor\\\" href=\\\"#路由器局域网的5g是什么\\\" aria-label=\\\"Permalink to “路由器局域网的5G是什么”\\\">&#8203;</a></h3>\\n<p>对于小白用户首先要区分手机 5G 和WiFi 5G的区别，两者名字相似，但是完全不是一个概念。手机5G = 第五代移动通信（5th Generation），G是代际的意思；路由器 5G WiFi=无线信号频段5GHz，G是 Giga 的简写，是量词，</p>\\n<p>现在的路由器都支持2.4GHz和5Ghz双频，同时默认给5GHz单独标注_5G标识，不同的设备根据需求连接不同的频段</p>\\n<p>| 项目 | 2.4GHz WiFi                                  | 5GHz WiFi                    |\\n|</p>\\n\"},{\"url\":\"/articles/life/smart-life/tuoyuanyi.html\",\"title\":\"家用椭圆仪\",\"description\":\"家用椭圆仪\",\"category\":\"生活指南\",\"tags\":[\"智能生活\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<h2 id=\\\"记录家用椭圆仪的选购过程\\\" tabindex=\\\"-1\\\">记录家用椭圆仪的选购过程 <a class=\\\"header-anchor\\\" href=\\\"#记录家用椭圆仪的选购过程\\\" aria-label=\\\"Permalink to “记录家用椭圆仪的选购过程”\\\">&#8203;</a></h2>\\n<p>在AI的帮助下，能够很宽泛的获知椭圆仪选购应该关注的参数。比较核心的指标是步距（越长越舒服），自发电比插电要贵几百块钱。带坡度调节可以刺激不同的肌肉群，也要贵几百块钱。家用还需要考虑占地面积。</p>\\n<p>从京东选了两个品牌的几个型号列举如下（2026年3月）</p>\\n<h2 id=\\\"迈瑞克\\\" tabindex=\\\"-1\\\">迈瑞克 <a class=\\\"header-anchor\\\" href=\\\"#迈瑞克\\\" aria-label=\\\"Permalink to “迈瑞克”\\\">&#8203;</a></h2>\\n<p>备注：仅包含<strong>自发电款</strong>，型号不全，仅有经典型号。</p>\\n<p>|            |    K60     |    K55     | 凌波L7Pro  | 凌波L3 |  T100  |\\n| :</p>\\n\"},{\"url\":\"/articles/life/smart-life/water.html\",\"title\":\"家庭净水\",\"description\":\"家庭净水使用指南\",\"category\":\"生活指南\",\"tags\":[\"智能生活\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/firm/Apple.html\",\"title\":\"APPLE\",\"description\":\"苹果公司介绍\",\"category\":\"置身事内\",\"tags\":[\"企业观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/firm/Baidu.html\",\"title\":\"百度\",\"description\":\"百度沉浮录\",\"category\":\"置身事内\",\"tags\":[\"企业观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/firm/nvidia.html\",\"title\":\"英伟达\",\"description\":\"老黄与英伟达\",\"category\":\"置身事内\",\"tags\":[\"企业观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/firm/spacex.html\",\"title\":\"SpaceX\",\"description\":\"火箭与星空\",\"category\":\"置身事内\",\"tags\":[\"企业观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<h2 id=\\\"猛禽发动机\\\" tabindex=\\\"-1\\\">猛禽发动机 <a class=\\\"header-anchor\\\" href=\\\"#猛禽发动机\\\" aria-label=\\\"Permalink to “猛禽发动机”\\\">&#8203;</a></h2>\\n<p><img src=\\\"/images/GUEhFjla8AANpDp.png\\\" alt=\\\"GUEhFjla8AANpDp\\\" width=\\\"3840\\\" height=\\\"2414\\\"></p>\\n<div class=\\\"tip custom-block\\\"><p class=\\\"custom-block-title custom-block-title-default\\\">TIP</p>\\n<p>如果不标注出来，是不是很容易认为最左侧是猛禽3？恰恰相反，从左到右依次是猛禽1、猛禽2和猛禽3。</p>\\n</div>\\n<h2 id=\\\"第十二次实验\\\" tabindex=\\\"-1\\\">第十二次实验 <a class=\\\"header-anchor\\\" href=\\\"#第十二次实验\\\" aria-label=\\\"Permalink to “第十二次实验”\\\">&#8203;</a></h2>\\n<p><img src=\\\"/images/HI-A85lXgAA1txM.png\\\" alt=\\\"HI-A85lXgAA1txM\\\" width=\\\"3840\\\" height=\\\"2090\\\"></p>\\n<p><img src=\\\"/images/HI-A7kbXEAEZyU_-1779799793308-5.png\\\" alt=\\\"HI-A7kbXEAEZyU_\\\" width=\\\"3840\\\" height=\\\"2160\\\"></p>\\n<p><img src=\\\"/images/HJCQV_LWUAAL76d.png\\\" alt=\\\"HJCQV_LWUAAL76d\\\" width=\\\"3500\\\" height=\\\"1974\\\"></p>\\n<p><img src=\\\"/images/HJCQXuOWkAAF3rY.png\\\" alt=\\\"HJCQXuOWkAAF3rY\\\" width=\\\"3500\\\" height=\\\"1941\\\"></p>\\n<h2 id=\\\"ipo申报\\\" tabindex=\\\"-1\\\">IPO申报 <a class=\\\"header-anchor\\\" href=\\\"#ipo申报\\\" aria-label=\\\"Permalink to “IPO申报”\\\">&#8203;</a></h2>\\n<h3 id=\\\"基本业务情况\\\" tabindex=\\\"-1\\\">基本业务情况 <a class=\\\"header-anchor\\\" href=\\\"#基本业务情况\\\" aria-label=\\\"Permalink to “基本业务情况”\\\">&#8203;</a></h3>\\n<p>SpaceX 的使命：即让生命成为 <strong>多行星文明</strong> 、探究宇宙真谛，并将意识之光播撒至繁星之中。</p>\\n<p>SpaceX’s mission: to make life <strong>multiplanetary</strong> , to understand the true nature of the universe, and to extend the light of consciousness to the stars.</p>\\n<p>核心理念： <strong>工程至上文化（Engineering-First Culture）</strong> ，“第一性原理思考”。</p>\\n<p>SpaceX的三大业务：太空、星链链接、AI。星链连接业务2025年的EBITDA为72亿美元，是唯一盈利的业务。</p>\\n<p>| 报告项目          | 2026 年 Q1 (截至3月31日) | 2025 全年  | 同比/变动情况 |\\n| :</p>\\n\"},{\"url\":\"/articles/zstn/gov/gov_invest.html\",\"title\":\"政府投资\",\"description\":\"政策梳理\",\"category\":\"置身事内\",\"tags\":[\"政府观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<h2 id=\\\"区分项目审批制、核准制、备案制\\\" tabindex=\\\"-1\\\">区分项目审批制、核准制、备案制 <a class=\\\"header-anchor\\\" href=\\\"#区分项目审批制、核准制、备案制\\\" aria-label=\\\"Permalink to “区分项目审批制、核准制、备案制”\\\">&#8203;</a></h2>\\n<p>首先，境内项目分为两种，第一种是政府投资项目，第二种是企业投资项目。（暂不考虑外商投资和境外投资）</p>\\n<p>第二，政府投资项目需要履行审批手续，即审批制。政府投资项目有三个特点：1.使用预算资金，2.以非经营性项目为主，3.以直接投资为主。对确需支持的经营性项目，主要采取资本金注入方式，也可以适当采取投资补助、贷款贴息等方式。审批机构：投资主管部门或者其他有关部门。审批手续：项目建议书、可行性研究报告、初步设计和投资概算审批程序。</p>\\n<p>第三，企业投资项目分为核准制和备案制，前者是目录管理且规定了核准层级，不在目录里的均为备案。县级以上人民政府投资主管部门对投资项目履行综合管理职责。核准制需要准备的手续：1.城乡规划行政主管部门出具的选址意见书（仅指以划拨方式提供国有土地使用权的项目）；2.国土资源（海洋）行政主管部门出具的用地（用海）预审意见（国土资源主管部门明确可以不进行用地预审的情形除外）；3.法律、行政法规规定需要办理的其他相关手续,以及项目基本信息。备案制仅需要项目基本信息。</p>\\n<p>最后，最新的文件国办发〔2026〕13号文有以下关注点和变化：</p>\\n<ol>\\n<li>针对政府投资项目的变化（审核制）：（1）对应由政府采取直接投资、资本金注入方式投资和实质性承担偿还责任的项目，严禁通过国有企业等以企业投资项目核准或备案形式规避政府投资项目审批。（2）优化省市县审批权限。（3）实行政府投资项目决策终身负责制；（4）所有项目均应严格履行项目建议书、可行性研究报告、初步设计和投资概算审批程序。（备注：2019年4月14日 《政府投资条例》要求政府直接投资、注资的项目需要履行）</li>\\n<li>针对企业投资项目核准制的变化：（1）动态修订须核准的项目目录（目前仍是发改委2016年版本），后续仍需关注发改委文件；（2）国家规定由省级政府核准的项目，核准权限不得下放；（3）企业投资的主题公园、大型文化场馆和旅游设施等文旅项目，以及公共体育场馆、会展场馆等项目由地市级以上地方政府核准，按照规定由国务院核准的项目，由国家发展改革委审核后报国务院核准；（4）核准权限可以动态调整上收、暂停。</li>\\n<li>针对企业投资项目备案制的变化：推进项目备案信息和备案证明标准化，加强备案信息完整性、产业政策符合性核查。严格限定项目备案信息变更频次，完善长期未开工项目备案撤销机制。</li>\\n<li>文件不涉及外商投资和境外投资。</li>\\n</ol>\\n<p>关于审批制、核准制、备案制的政策文件梳理</p>\\n<p>首先，境内项目分为两种，第一种是政府投资项目，第二种是企业投资项目。（暂不考虑外商投资和境外投资）</p>\\n<p>第二，政府投资项目需要履行审批手续，即审批制。政府投资项目有三个特点：1.使用预算资金，2.以非经营性项目为主，3.以直接投资为主。对确需支持的经营性项目，主要采取资本金注入方式，也可以适当采取投资补助、贷款贴息等方式。审批机构：投资主管部门或者其他有关部门。审批手续：项目建议书、可行性研究报告、初步设计和投资概算审批程序。</p>\\n<p>第三，企业投资项目分为核准制和备案制，前者是目录管理且规定了核准层级，不在目录里的均为备案。县级以上人民政府投资主管部门对投资项目履行综合管理职责。核准制需要准备的手续：1.城乡规划行政主管部门出具的选址意见书（仅指以划拨方式提供国有土地使用权的项目）；2.国土资源（海洋）行政主管部门出具的用地（用海）预审意见（国土资源主管部门明确可以不进行用地预审的情形除外）；3.法律、行政法规规定需要办理的其他相关手续,以及项目基本信息。备案制仅需要项目基本信息。</p>\\n<p>最后，最新的文件国办发〔2026〕13号文有以下关注点和变化：</p>\\n<ol>\\n<li>针对政府投资项目的变化（审核制）：（1）对应由政府采取直接投资、资本金注入方式投资和实质性承担偿还责任的项目，严禁通过国有企业等以企业投资项目核准或备案形式规避政府投资项目审批。（2）优化省市县审批权限。（3）实行政府投资项目决策终身负责制；（4）所有项目均应严格履行项目建议书、可行性研究报告、初步设计和投资概算审批程序。（备注：2019年4月14日 《政府投资条例》要求政府直接投资、注资的项目需要履行）</li>\\n<li>针对企业投资项目核准制的变化：（1）动态修订须核准的项目目录（目前仍是发改委2016年版本），后续仍需关注发改委文件；（2）国家规定由省级政府核准的项目，核准权限不得下放；（3）企业投资的主题公园、大型文化场馆和旅游设施等文旅项目，以及公共体育场馆、会展场馆等项目由地市级以上地方政府核准，按照规定由国务院核准的项目，由国家发展改革委审核后报国务院核准；（4）核准权限可以动态调整上收、暂停。</li>\\n<li>针对企业投资项目备案制的变化：推进项目备案信息和备案证明标准化，加强备案信息完整性、产业政策符合性核查。严格限定项目备案信息变更频次，完善长期未开工项目备案撤销机制。</li>\\n<li>文件不涉及外商投资和境外投资。</li>\\n</ol>\\n<p>政策文件目录</p>\\n<p>| 颁布时间          | 文号                | 标题                                                     | 网址                                                         |\\n|</p>\\n\"},{\"url\":\"/articles/zstn/gov/yinzai.html\",\"title\":\"隐债\",\"description\":\"财政部隐债通报\",\"category\":\"置身事内\",\"tags\":[\"地方政府\",\"地方债务\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/macro/economic-cycle.html\",\"title\":\"周期\",\"description\":\"经济周期\",\"category\":\"置身事内\",\"tags\":[\"宏观观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/macro/global-economics.html\",\"title\":\"全球化\",\"description\":\"全球化\",\"category\":\"置身事内\",\"tags\":[\"宏观观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/macro/real-estate.html\",\"title\":\"房地产\",\"description\":\"房地产市场\",\"category\":\"置身事内\",\"tags\":[\"宏观观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"<h2 id=\\\"_2026年8月28日房地产信贷政策\\\" tabindex=\\\"-1\\\">2026年8月28日房地产信贷政策 <a class=\\\"header-anchor\\\" href=\\\"#_2026年8月28日房地产信贷政策\\\" aria-label=\\\"Permalink to “2026年8月28日房地产信贷政策”\\\">&#8203;</a></h2>\\n<p>8月28日晚间，人民银行、住建部、金融监管总局等多部门密集出台了一系列房地产政策文件，除信托管理办法外，全部立即生效执行，主要文件包括：</p>\\n<p>| 文号              | 文件名称                                                     | 发文单位                         | 核心内容                                                     | 新老划断节点               |\\n|</p>\\n\"},{\"url\":\"/articles/zstn/macro/us-real-estate.html\",\"title\":\"美国房地产\",\"description\":\"美国房地产\",\"category\":\"置身事内\",\"tags\":[\"宏观观察\"],\"date\":\"2026-05-29\",\"ts\":1780012800000,\"excerpt\":\"\"},{\"url\":\"/articles/ai/ai-tech/deepseekV4.html\",\"title\":\"DeepSeekV4，继续开源\",\"description\":\"传闻中的DeepSeek V4模型终于来了，性能比肩顶级闭源模型。关键是，开源！开源！造福一方！API费用低，被媒体亲切的欢呼“迈入百万上下文普惠时代”。\",\"category\":\"AI世界\",\"tags\":[\"AI技术\"],\"date\":\"2026-04-25\",\"ts\":1777075200000,\"excerpt\":\"<p><img src=\\\"https://static.wyclab.com/20260424233837491260424.webp\\\" alt=\\\"\\\"></p>\\n<p>传闻中的DeepSeek V4模型终于来了。</p>\\n<p>从2025年1月，DeepSeek-R1惊艳全国、闪亮登场以来，各路AI就像各路诸侯一样，快速迭代，参数越来越强大，你方唱罢我登场，每个十天半个月，就有宣称“史上最强”的模型推出。更何况还有AI Agent、龙虾Open Claw等各类概念满天飞。博主作为一个普通人，甚至对这些AI不断登顶的新闻都麻木了。</p>\\n<p>而这次DeepSeek-V4被各路媒体争先恐后的报道，我个人认为是人民心中的地位比较高、群众知晓度比较高。根据官方的宣传文档，V4 PRO版本的性能比肩顶级闭源模型 。所谓的顶级闭源模型，自然是指美国AI三幻神：Claude 、GPT 、Gemini，分别对应美资企业<strong>Anthropic</strong> 公司、 <strong>OpenAI</strong> 公司、<strong>Google</strong>（谷歌）公司，他们用着最先进的英伟达芯片训练自己的模型，但无一例外都选择了<strong>“闭源”</strong>。（哪怕名字里带有Open，哈哈）</p>\\n<p>而国内的AI生态，在Deepseek的带领下，不仅竞争格局更加百花齐放，并且Kimi、阿里千问、智谱等均选择开源自己的头部模型。开源意味着政府、企业可以本地化部署，满足自托管的保密要求。也意味着中小企业、甚至个人，获得了站在巨人的肩膀上的机会，百家争鸣，争相攀登技术高峰。</p>\\n<p>更值得一提的是，<strong>DeepSeek V4</strong> 延续了其“价格屠夫”的定位，API费用是头部模型的几十分之一。博主通过Gemini Pro整理如下：</p>\\n<p>| <strong>模型开发商</strong>  | <strong>旗舰模型名称</strong>    | <strong>输入价格 (1M Tokens)</strong> | <strong>输出价格 (1M Tokens)</strong> | <strong>成本分析与优势</strong>                                           |\\n|</p>\\n\"},{\"url\":\"/articles/notes/diary/lifataolu.html\",\"title\":\"熟客理发师搞消费套路\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2026-04-21\",\"ts\":1776729600000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/website/edgeonesecret.html\",\"title\":\"使用边缘加速/CDN时要小心私密照片被公开缓存\",\"description\":\"默认情况下，CDN 仅根据 URL 缓存，一旦图片被缓存，任何人访问该 URL 都会命中同一个文件。\",\"category\":\"随笔\",\"tags\":[\"建站笔记\"],\"date\":\"2026-04-20\",\"ts\":1776643200000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/diary/shijiuchennianhua.html\",\"title\":\"人生的二叉树理论和复利理论\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2026-04-18\",\"ts\":1776470400000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/gov/96110.html\",\"title\":\"反诈、社会成本与个人隐私\",\"description\":\"\",\"category\":\"置身事内\",\"tags\":[\"政府观察\"],\"date\":\"2026-04-09\",\"ts\":1775692800000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/diary/qingming2026.html\",\"title\":\"清明与乡土\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2026-04-07\",\"ts\":1775520000000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/website/hellovuepress.html\",\"title\":\"搭建VUEPRSS文档+Github+腾讯云EdgeOne\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"建站笔记\"],\"date\":\"2026-04-06\",\"ts\":1775433600000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/website/walineforfuwari.html\",\"title\":\"Fuwari增加Waline评论系统\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"建站笔记\"],\"date\":\"2026-04-06\",\"ts\":1775433600000,\"excerpt\":\"<p>基于Astro的Fuwari主题非常优雅。静态、敏捷，并且页面切换动画非常丝滑、精美。作为博客，评论系统是必备的，经过和Gemini的疯狂对话，整理Fuwari增加Waline评论系统的操作指南如下：</p>\\n<p>首先要理解Waline的架构：Waline是前端+后端的评论系统，后端需要部署在服务器或者类似于Vercel的云函数；前端需要在博客页面加载。下面分别介绍：</p>\\n<h2 id=\\\"安装后端\\\" tabindex=\\\"-1\\\">安装后端 <a class=\\\"header-anchor\\\" href=\\\"#安装后端\\\" aria-label=\\\"Permalink to “安装后端”\\\">&#8203;</a></h2>\\n<p>参照官方文档：<a href=\\\"https://waline.js.org/guide/get-started/server.html\\\" target=\\\"_blank\\\" rel=\\\"noreferrer\\\">服务端介绍</a>，推荐部署在<a href=\\\"https://waline.js.org/guide/get-started/\\\" target=\\\"_blank\\\" rel=\\\"noreferrer\\\">Vercel</a>。如果有自己的服务器也可以独立部署。因为官方文档非常详细了，所以不再赘述。</p>\\n<p>博主使用的<code>1 Panel</code>面板，可以在应用商店中一键安装。安装后需要绑定域名并设置SSL。</p>\\n<p>通过编辑compose 文件，常用的后端环境参数如下：</p>\\n<div class=\\\"language-\\\"><button title=\\\"Copy code\\\" data-copied=\\\"Copied\\\" class=\\\"copy\\\"></button><span class=\\\"lang\\\"></span><pre class=\\\"shiki shiki-themes github-light github-dark\\\" style=\\\"--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e\\\" tabindex=\\\"0\\\" dir=\\\"ltr\\\" v-pre=\\\"\\\"><code><span class=\\\"line\\\"><span> environment:</span></span>\\n<span class=\\\"line\\\"><span>  - SQLITE_PATH=SQLITE路径</span></span>\\n<span class=\\\"line\\\"><span>  - TZ=Asia/Shanghai</span></span>\\n<span class=\\\"line\\\"><span>  - JWT_TOKEN=登陆密钥</span></span>\\n<span class=\\\"line\\\"><span>  - COMMENT_AUDIT=false是否开始审核</span></span>\\n<span class=\\\"line\\\"><span>  - AUTHOR_EMAIL=作者邮箱</span></span>\\n<span class=\\\"line\\\"><span>  - SITE_NAME=网站名称</span></span>\\n<span class=\\\"line\\\"><span>  - SITE_URL=网站地址</span></span>\\n<span class=\\\"line\\\"><span>  - SECURE_DOMAINS=安全地址，配置时安全域名需要同时添加网站地址和 Waline 服务端地址（不包含传输协议，即 http:// 或 https://）。</span></span>\\n<span class=\\\"line\\\"><span>  - SMTP_SERVICE=SMTP服务商</span></span>\\n<span class=\\\"line\\\"><span>  - SMTP_USER=SMTP发件人</span></span>\\n<span class=\\\"line\\\"><span>  - SMTP_PASS=SMTP密码</span></span>\\n<span class=\\\"line\\\"><span>  - SMTP_SECURE=true</span></span>\\n<span class=\\\"line\\\"><span>  - DISABLE_REGION=true 隐藏评论者的IP归属地）</span></span>\\n<span class=\\\"line\\\"><span>  - DISABLE_USERAGENT=true 隐藏评论者的 UA</span></span>\\n<span class=\\\"line\\\"><span>  - AVATAR_PROXY=https://cravatar.cn/avatar/{{mail|md5}}</span></span>\\n<span class=\\\"line\\\"><span>  - AKISMET_KEY=false 关闭垃圾检测，海外服务拖慢速度</span></span>\\n<span class=\\\"line\\\"><span>  - GRAVATAR_STR=https://cravatar.cn/avatar/</span></span></code></pre>\\n</div><p>更多环境变量详见官方文档-<a href=\\\"https://waline.js.org/reference/server/env.html\\\" target=\\\"_blank\\\" rel=\\\"noreferrer\\\">服务端环境变量</a></p>\\n<p>完成后端部署后，waline服务地址就是<code>https://你的waline后端域名</code>。打开<code>https://你的waline后端域名/ui/register</code>进行注册，第一个注册的账号就是博主。</p>\\n<h2 id=\\\"加载前端\\\" tabindex=\\\"-1\\\">加载前端 <a class=\\\"header-anchor\\\" href=\\\"#加载前端\\\" aria-label=\\\"Permalink to “加载前端”\\\">&#8203;</a></h2>\\n<h3 id=\\\"_1-将官方客户端导入项目\\\" tabindex=\\\"-1\\\">1.将官方客户端导入项目 <a class=\\\"header-anchor\\\" href=\\\"#_1-将官方客户端导入项目\\\" aria-label=\\\"Permalink to “1.将官方客户端导入项目”\\\">&#8203;</a></h3>\\n<p>根据官方文档，Waline 官方客户端已通过 <code>@waline/client</code> 发布到 <a href=\\\"https://www.npmjs.com/package/@waline/client\\\" target=\\\"_blank\\\" rel=\\\"noreferrer\\\">npm</a>，可以通过以下命令安装:</p>\\n<div class=\\\"language-bash\\\"><button title=\\\"Copy code\\\" data-copied=\\\"Copied\\\" class=\\\"copy\\\"></button><span class=\\\"lang\\\">bash</span><pre class=\\\"shiki shiki-themes github-light github-dark\\\" style=\\\"--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e\\\" tabindex=\\\"0\\\" dir=\\\"ltr\\\" v-pre=\\\"\\\"><code><span class=\\\"line\\\"><span style=\\\"--shiki-light:#6F42C1;--shiki-dark:#B392F0\\\">pnpm</span><span style=\\\"--shiki-light:#032F62;--shiki-dark:#9ECBFF\\\"> add</span><span style=\\\"--shiki-light:#005CC5;--shiki-dark:#79B8FF\\\"> -D</span><span style=\\\"--shiki-light:#032F62;--shiki-dark:#9ECBFF\\\"> @waline/client</span></span></code></pre>\\n</div><p>使用方法：在你的博客根目录下运行上述命令。（可以直接使用Windows自带的命令提示符，右键-在终端中打开）</p>\\n<p><img src=\\\"/images/image-20260406071313653.png\\\" alt=\\\"image-20260406071313653\\\" width=\\\"1376\\\" height=\\\"470\\\"></p>\\n<h3 id=\\\"_2-创建-waline-组件\\\" tabindex=\\\"-1\\\">2.创建 Waline 组件 <a class=\\\"header-anchor\\\" href=\\\"#_2-创建-waline-组件\\\" aria-label=\\\"Permalink to “2.创建 Waline 组件”\\\">&#8203;</a></h3>\\n<p>在 <code>src/components/</code> 目录下新建一个文件 <code>Waline.astro</code>，如果没有编译器，可以直接用记事本打开，粘贴以下内容</p>\\n<div class=\\\"language-astro\\\"><button title=\\\"Copy code\\\" data-copied=\\\"Copied\\\" class=\\\"copy\\\"></button><span class=\\\"lang\\\">astro</span><pre class=\\\"shiki shiki-themes github-light github-dark\\\" style=\\\"--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e\\\" tabindex=\\\"0\\\" dir=\\\"ltr\\\" v-pre=\\\"\\\"><code><span class=\\\"line\\\"></span></code></pre>\\n</div>\"},{\"url\":\"/articles/zstn/firm/zhaohang.html\",\"title\":\"“加班”银行阻碍了共同富裕\",\"description\":\"\",\"category\":\"置身事内\",\"tags\":[\"企业观察\"],\"date\":\"2026-03-31\",\"ts\":1774915200000,\"excerpt\":\"<p>2026年3月30日，招商银行董事长在2025年度业绩发布会上说：</p>\\n<blockquote>\\n<p>我们同事很少准点下班</p>\\n<p>周五公布完业绩后，这么厚一本材料，（周末）两天时间全部搞出来了。</p>\\n<p>这就是公司文化</p>\\n<p>我觉得这是最大的护城河</p>\\n</blockquote>\\n<p>招商银行的护城河竟然是加班文化，和“996是福报”有异曲同工之妙。想必这位董事长也是身居高位久了，和一位消失在公众视野的故人一样，大放厥词，视劳动法为无物，视劳动者为草芥。</p>\\n<p>博主认为，加班文化恰恰是阻碍共同富裕的绊脚石，加班内卷，一会带来岗位的下降、失业人口增加，二是岗位上的人看似获得了1.5倍甚至更高的工资，但失去时间、失去消费和家庭，打击宏观经济循环和生育率。</p>\\n<p>因此，博主的结论就是：以加班文化为护城河的招商银行，就是共同富裕的绊脚石。</p>\\n<p>私以为，招商银行的护城河，并不敢真的亮相——</p>\\n<p>2024年之前，招商银行会公布私人银行客户情况，通过Gemini查询数据如下：</p>\\n<p>| <strong>年份</strong> | <strong>私人银行客户数（万户）</strong> | <strong>客户数同比增速</strong> | <strong>私行总资产（万亿元）</strong> | <strong>资产同比增速</strong> | <strong>户均资产（万元）</strong> |\\n|</p>\\n\"},{\"url\":\"/articles/notes/diary/diyizuofen.html\",\"title\":\"心头的第一座坟\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2026-02-09\",\"ts\":1770595200000,\"excerpt\":\"\"},{\"url\":\"/articles/ai/ai-tech/aijingjiweiji.html\",\"title\":\"AI、机器人与经济危机\",\"description\":\"\",\"category\":\"AI世界\",\"tags\":[\"AI技术\"],\"date\":\"2026-02-01\",\"ts\":1769904000000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/firm/masikehuojian.html\",\"title\":\"不锈钢造火箭，什么是马斯克第一性原理\",\"description\":\"\",\"category\":\"置身事内\",\"tags\":[\"企业观察\"],\"date\":\"2026-01-30\",\"ts\":1769731200000,\"excerpt\":\"\"},{\"url\":\"/articles/ai/ai-tech/aifeiren.html\",\"title\":\"AI时代的废人\",\"description\":\"\",\"category\":\"AI世界\",\"tags\":[\"AI技术\"],\"date\":\"2026-01-29\",\"ts\":1769644800000,\"excerpt\":\"\"},{\"url\":\"/articles/life/smart-life/shuzirensheng.html\",\"title\":\"数字人生计划\",\"description\":\"\",\"category\":\"生活指南\",\"tags\":[\"智能生活\"],\"date\":\"2026-01-08\",\"ts\":1767830400000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/macro/2025.html\",\"title\":\"2025年快要结束，聊一聊通胀与通缩\",\"description\":\"\",\"category\":\"置身事内\",\"tags\":[\"宏观观察\"],\"date\":\"2025-12-08\",\"ts\":1765152000000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/firm/moerxiancheng.html\",\"title\":\"摩尔线程IPO，什么来头？\",\"description\":\"\",\"category\":\"置身事内\",\"tags\":[\"企业观察\"],\"date\":\"2025-09-29\",\"ts\":1759104000000,\"excerpt\":\"<blockquote>\\n<p>摩尔线程的数据中心卡旗舰产品为 S5000，单从 FP32 精度的算力的角度，摩尔线程 S5000 约为英伟达 H20（中国特供）的 70%，约为英伟达旗舰产品 B200 的 40%，因为缺少其他参数，无法做出综合比较。</p>\\n<p>桌面消费级卡旗舰产品为 S80，与英伟达 RTX3060 相当（价格也相当，均为 1500-2000 元之间）；通过横向对比旗舰产品，摩尔线程的消费级 GPU 旗舰产品 S80 相当于英伟达 2015 年的旗舰产品，即十年前的产品。通过对比现有的旗舰产品，英伟达消费级旗舰产品 RTX 5090 约是摩尔线程旗舰产品的 7 倍以上（FP32 精度算力），当然价格相差 15 倍以上。</p>\\n<p>结论是在国产替代、自主可控的帽子下，如果代工厂能够稳定合作，企业具备一定竞争力。</p>\\n</blockquote>\\n<h2 id=\\\"简况\\\" tabindex=\\\"-1\\\"><strong>简况</strong> <a class=\\\"header-anchor\\\" href=\\\"#简况\\\" aria-label=\\\"Permalink to “简况”\\\">&#8203;</a></h2>\\n<p>2020 年 10 月成立以来，公司一直采用 Fabless 经营模式，专注于全功能 GPU 芯片及相关产品的研发、设计和销售，将晶圆制造、封装测试、板卡加工等其余环节交由晶圆制造企业、封装测试企业及其他加工厂商完成。【未披露代工厂是谁，根据网络信息是中芯国际14nm/7nm工艺】</p>\\n<p>根据 IPO 说明书，摩尔线程在国内 GPU 领域处于领先地位，基于自主研发的 MUSA 架构（注：摩尔线程走的兼容路线，其架构兼容英伟达的 CUDA）。公司于 2023 年 10 月被美国列入“实体清单”，对公司采购美国生产原材料、 采购或使用含有美国技术的知识产权和研发工具等产生一定限制。</p>\\n<p>财务简况：持续亏损，2022-2024 年，发行人累计研发投入为 38.10 亿元。（作为对比，寒武纪的近三年研发投入 38.57 亿元，英伟达近三年为 271.81 亿美元）</p>\\n<p><img src=\\\"/images/image-VrfB-1774859758695-1.png\\\" alt=\\\"img\\\" width=\\\"3993\\\" height=\\\"1957\\\"></p>\\n<h2 id=\\\"_7-名高管情况\\\" tabindex=\\\"-1\\\"><strong>7 名高管情况</strong> <a class=\\\"header-anchor\\\" href=\\\"#_7-名高管情况\\\" aria-label=\\\"Permalink to “7 名高管情况”\\\">&#8203;</a></h2>\\n<p><strong>张建中先生</strong>，摩尔线程创始人、董事长、总经理，中国国籍，硕士研究生学历，高级工程师。1990 年 5 月至 1992 年 3 月，于冶金自动化研究设计院国家计算机实验室部门任高级研究员；1992 年 4 月至 2001 年 5 月，于中国惠普有限公司 1 任产品总经理；2001 年 6 月至 2006 年 3 月，于戴尔（中国）有限公司全球客户部任总经理；2006 年 4 月至 2020 年 9 月，于英伟达任全球副总裁，大中华区总经理；2020 年 10 月摩尔线程开始运营后，以实控人身份参与公司经营管理，2023 年 11 月至今任摩尔线程总经理，2023 年 12 月至今任摩尔线程董事长。</p>\\n<p><strong>薛岩松先生</strong>，男，1973 年 6 月出生，摩尔线程董事会秘书及财务负责人。简历略。</p>\\n<p><strong>张钰勃先生</strong>，摩尔线程联合创始人、董事、副总经理，中国国籍，博士研究生学历。2013 年 10 月至 2017 年 11 月，于英伟达任 GPU 架构师；2017 年 11 月至 2020 年 9 月，于 Pony AI Inc.基础架构部门任主任工程师；2020 年联合创立摩尔线程，历任摩尔线程监事、董事、副总经理。</p>\\n<p><strong>杨上山先生，</strong>摩尔线程副总经理，中国国籍，硕士研究生学历。2009 年 4 月至 2011 年 1 月，于上海贝尔阿尔卡特股份有限公司任软件工程师；2011 年 1 月至 2012 年 4 月，于爱立信（中国）通信有限公司任软件工程师；2012 年 4 月至 2020 年 10 月，于英伟达任 GPU 架构师；2020 年 10 月至今，任摩尔线程软件研发部总经理；2024 年 12 月至今，任摩尔线程副总经理。</p>\\n<p><strong>王东先生</strong>，摩尔线程联合创始人、副总经理，中国国籍，本科学历。1999 年 7 月至 2000 年 5 月，于北京市晓林科贸公司任销售副总；2000 年 6 月至 2001 年 2 月，于北京硅谷动力电子商务有限公司任产品经理；2001 年 5 月至 2004 年 5 月，于英迈国际贸易（上海）有限公司任产品总监；2004 年 6 月至 2007 年 9 月，于精英电脑股份有限公司任销售总监；2007 年 10 月至 2019 年 3 月，于英伟达任销售总监；2020 年联合创立摩尔线程，历任摩尔线程监事、董事会秘书、副总经理。</p>\\n<p><strong>宋学军先生</strong>，摩尔线程副总经理，中国国籍，本科学历。2004 年 10 月至 2011 年 5 月，于英伟达任高级销售经理；2012 年 5 月至 2013 年 1 月，于智祥科技中国香港有限公司任副总经理；2013 年 1 月至 2014 年 6 月，于联芯科技有限公司任产品开发技术负责人；2014 年 6 月至 2017 年 4 月，于忆正科技股份有限公司任中国区销售总经理；2017 年 4 月至 2019 年 5 月，于晶兆创新股份有限公司任协理；2019 年 5 月至 2020 年 7 月，于湖南国科微电子股份有限公司任高级销售总监；2020 年 10 月至今，任摩尔线程战略合作部总经理；2024 年 12 月至今，任摩尔线程副总经理。</p>\\n<p><strong>常玉保先生</strong>，摩尔线程副总经理，中国国籍，硕士研究生学历。2007 年 1 月至 2011 年 2 月，于北京中星微电子有限公司任芯片验证工程师；2011 年 2 月至 2018 年 8 月，于北京楷登信息技术有限公司任资深技术支持经理；2018 年 9 月至 2020 年 7 月，于北京智云芯科技有限公司任 CTO；2020 年 10 月至今，任摩尔线程芯片验证部总经理；2024 年 12 月至今，任摩尔线程副总经理。</p>\\n<p>7 名高管中，除掉董秘/财务负责人，剩余 6 人中，技术背景 3 人，销售背景 3 人。且从履历上看，英伟达前员工的含量很高。</p>\\n<p>‍</p>\\n<h2 id=\\\"产品一览\\\" tabindex=\\\"-1\\\"><strong>产品一览</strong> <a class=\\\"header-anchor\\\" href=\\\"#产品一览\\\" aria-label=\\\"Permalink to “产品一览”\\\">&#8203;</a></h2>\\n<p>根据募集说明书，企业的产品主要是 GPU 产品，根据应用场景（纵轴）和集成程度（横轴）可以划分如下：</p>\\n<p><img src=\\\"/images/image-KmGX-1774859770700-4.png\\\" alt=\\\"img\\\" width=\\\"789\\\" height=\\\"570\\\"></p>\\n<p>根据上图，我们可以清晰的看到，摩尔线程的 GPU 已经迭代了四代，其中消费级使用二代，AI 智算使用四代芯片。围绕芯片核心，拓展了板卡、一体机/服务器、集群设备三种形态，如下图（示意图，与摩尔线程无关）</p>\\n<p><img src=\\\"/images/image-gjDu-1774859781594-7.png\\\" alt=\\\"img\\\" width=\\\"960\\\" height=\\\"449\\\"></p>\\n<h2 id=\\\"和英伟达掰一掰手腕\\\" tabindex=\\\"-1\\\"><strong>和英伟达掰一掰手腕</strong> <a class=\\\"header-anchor\\\" href=\\\"#和英伟达掰一掰手腕\\\" aria-label=\\\"Permalink to “和英伟达掰一掰手腕”\\\">&#8203;</a></h2>\\n<p>募集说明书没有披露具体参数。从官网找了一些产品参数，看一看和英伟达能不能掰一掰手腕：</p>\\n<h3 id=\\\"_1-数据中心卡\\\" tabindex=\\\"-1\\\"><strong>1.数据中心卡</strong> <a class=\\\"header-anchor\\\" href=\\\"#_1-数据中心卡\\\" aria-label=\\\"Permalink to “1.数据中心卡”\\\">&#8203;</a></h3>\\n<p>MTT S5000：根据募集说明书，摩尔线程已经迭代出了第四代芯片，并打造了 S5000 板卡产品。其 32 位浮点运算的算力达到了 32TFLOPS (Tera Floating point number operations per second) 每秒处理浮点数的 <strong>32 万亿</strong>次数。英伟达的旗舰产品 B200 同等精度下为 80TFLOPS，H100 是 67TFLOPS，中国特供 H20 在同等精度的算力是 44TFLOPS。</p>\\n<p><img src=\\\"/images/image-KJaQ-1774859788701-10.png\\\" alt=\\\"img\\\" width=\\\"745\\\" height=\\\"201\\\"></p>\\n<p>如此看来，单从算力的角度，摩尔线程 S5000 约为 H20（中国特供）的 70%，约为旗舰产品 B200 的 40%。因为缺少其他参数，无法做出综合比较。</p>\\n<h3 id=\\\"_2-家用消费级卡\\\" tabindex=\\\"-1\\\"><strong>2.家用消费级卡</strong> <a class=\\\"header-anchor\\\" href=\\\"#_2-家用消费级卡\\\" aria-label=\\\"Permalink to “2.家用消费级卡”\\\">&#8203;</a></h3>\\n<p>游戏 MTTS80 京东售价 1499 元。官方宣称其性能规格与英伟达 RTX 3060 相当。公司推出的国内首款支持 Windows 操作系统以及 DirectX 11/12 图形计算库的消费级显卡。</p>\\n<p><img src=\\\"/images/image-XGAJ-1774859794343-13.png\\\" alt=\\\"img\\\" width=\\\"2400\\\" height=\\\"1200\\\"></p>\\n<p><img src=\\\"/images/image-fDEK-1774859803519-16.png\\\" alt=\\\"img\\\" width=\\\"1180\\\" height=\\\"896\\\"></p>\\n<p>根据网络信息，RTX3060 于 2021 年上市，目前京东售价 1899 元，在数据可比参数上确实接近，具体如下表：</p>\\n<p>| <strong>参数</strong>       | <strong>GeForce RTX 3060</strong>              |\\n|</p>\\n\"},{\"url\":\"/articles/notes/journal/xihu.html\",\"title\":\"西湖掠影\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"游记\"],\"date\":\"2025-09-24\",\"ts\":1758672000000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/diary/tiqianhuandai.html\",\"title\":\"我也要提前还贷了\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2025-09-18\",\"ts\":1758153600000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/law/jiya.html\",\"title\":\"一个无罪的人怎么被合法羁押三百天\",\"description\":\"\",\"category\":\"置身事内\",\"tags\":[\"法治观察\"],\"date\":\"2025-08-15\",\"ts\":1755216000000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/diary/biye5nian.html\",\"title\":\"又是一年毕业季，写写毕业后被偷走的五年\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2025-06-19\",\"ts\":1750291200000,\"excerpt\":\"\"},{\"url\":\"/articles/zstn/gov/2025xianxin.html\",\"title\":\"2025年限薪！\",\"description\":\"\",\"category\":\"置身事内\",\"tags\":[\"政府观察\"],\"date\":\"2025-02-01\",\"ts\":1738368000000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/diary/kaichangtu.html\",\"title\":\"一个人开长途真累\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2024-09-26\",\"ts\":1727308800000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/diary/zhejianghuifang.html\",\"title\":\"浙江回访思绪杂谈\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2024-08-29\",\"ts\":1724889600000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/diary/sheyude.html\",\"title\":\"舍与得\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2023-09-28\",\"ts\":1695859200000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/journal/beiwugongyuan.html\",\"title\":\"北坞秋日游记\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"游记\"],\"date\":\"2023-09-08\",\"ts\":1694131200000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/diary/iphone7plus.html\",\"title\":\"记录一次iPhone维修经历\",\"description\":\"用了将近一年的iPhone 7 Plus的后置摄像头摔坏了，外观无损伤，但无法拍照。保修期内，Apple直营店在更换摄像头无果后，返厂维修，顺便免费更换了主板、电池、屏幕（好像赠送了Apple Care），好吧，除了手机后壳几乎都换掉了，拿回几乎全新的手机。感谢苹果~\",\"category\":\"随笔\",\"tags\":[\"日记\"],\"date\":\"2018-05-05\",\"ts\":1525478400000,\"excerpt\":\"\"},{\"url\":\"/articles/notes/books/read-daerbudao.html\",\"title\":\"《大而不倒》读书笔记\",\"description\":\"\",\"category\":\"随笔\",\"tags\":[\"读书笔记\"],\"date\":\"2016-06-04\",\"ts\":1464998400000,\"excerpt\":\"\"}]");
//#endregion
//#region .vitepress/theme/components/HomeLayout.vue
var authorName = "无用处";
var authorDesc = "无用之物是最高等级的美好";
var siteTitle = "无用处实验室";
var siteDesc = "折腾一些好玩的，看似无用，实则真的无用。";
var AUTOPLAY_MS = 4500;
var _sfc_main$9 = {
	__name: "HomeLayout",
	__ssrInlineRender: true,
	setup(__props) {
		const avatar = withBase("/favicon/android-chrome-512x512.png");
		const socials = [{
			name: "GitHub",
			link: "https://github.com/wyclab"
		}, {
			name: "RSS订阅",
			link: "/feed.xml"
		}];
		const tagCounts = computed(() => {
			const map = /* @__PURE__ */ new Map();
			for (const p of data) for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1);
			return [...map.entries()].sort((a, b) => b[1] - a[1]);
		});
		const recommended = computed(() => data.filter((p) => p.description).slice(0, 6));
		const recPages = computed(() => {
			const pages = [];
			for (let i = 0; i < recommended.value.length; i += 2) pages.push(recommended.value.slice(i, i + 2));
			return pages;
		});
		const current = ref(0);
		let timer = null;
		function startAutoplay() {
			stopAutoplay();
			if (recPages.value.length <= 1) return;
			timer = setInterval(() => {
				go(current.value + 1);
			}, AUTOPLAY_MS);
		}
		function stopAutoplay() {
			if (timer) clearInterval(timer);
			timer = null;
		}
		function go(index) {
			const n = recPages.value.length;
			if (!n) return;
			const next = (index % n + n) % n;
			if (next === current.value) return;
			current.value = next;
			buzz();
		}
		function buzz(ms = 8) {
			try {
				navigator.vibrate?.(ms);
			} catch {}
		}
		ref(null);
		const dragging = ref(false);
		const dragX = ref(0);
		ref(false);
		onMounted(() => startAutoplay());
		onUnmounted(() => stopAutoplay());
		const latest = computed(() => data.slice(0, 8));
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "blog-home" }, _attrs))}><div class="container"><div class="top-grid"><div class="top-left"><div class="hero-card card"><div><h1 class="hero-title">${ssrInterpolate(siteTitle)}</h1><p class="hero-desc">${ssrInterpolate(siteDesc)}</p></div><div class="head-wrapper"><img class="head-img"${ssrRenderAttr("src", unref(avatar))}${ssrRenderAttr("alt", authorName)}><div class="head-info"><h3 class="head-name">${ssrInterpolate(authorName)}</h3><p class="head-desc">${ssrInterpolate(authorDesc)}</p><div class="head-social"><!--[-->`);
			ssrRenderList(socials, (s) => {
				_push(`<a class="social-link"${ssrRenderAttr("href", s.link)} target="_blank" rel="noopener"${ssrRenderAttr("title", s.name)}>${ssrInterpolate(s.name)}</a>`);
			});
			_push(`<!--]--></div></div></div>`);
			if (tagCounts.value.length) {
				_push(`<div class="tag-marquee"><div class="tag-marquee-track"><!--[-->`);
				ssrRenderList(2, (n) => {
					_push(`<div class="tag-marquee-group"${ssrRenderAttr("aria-hidden", n === 2)}><!--[-->`);
					ssrRenderList(tagCounts.value, ([tag, count]) => {
						_push(`<a class="tag-link"${ssrRenderAttr("href", unref(withBase)("/pages/tags/?q=" + encodeURIComponent(tag)))}><span class="tag-count">#</span>${ssrInterpolate(tag)} <span class="tag-count">${ssrInterpolate(count)}</span></a>`);
					});
					_push(`<!--]--></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`</div></div><div class="top-right"><div class="recommend-card card"><div class="recommend-head"><h2>精选推荐</h2><div class="recommend-indicators"><!--[-->`);
			ssrRenderList(recPages.value, (page, i) => {
				_push(`<button class="${ssrRenderClass([{ active: i === current.value }, "indicator-dot"])}"${ssrRenderAttr("aria-label", `第 ${i + 1} 页`)}></button>`);
			});
			_push(`<!--]--></div></div><div class="${ssrRenderClass([{ "is-dragging": dragging.value }, "recommend-list"])}"><div class="recommend-track" style="${ssrRenderStyle({ transform: `translateX(calc(${-current.value * 100}% + ${dragX.value}px))` })}"><!--[-->`);
			ssrRenderList(recPages.value, (page, pi) => {
				_push(`<div class="recommend-page"><!--[-->`);
				ssrRenderList(page, (p) => {
					_push(`<a class="recommend-item"${ssrRenderAttr("href", unref(withBase)(p.url))}><span class="recommend-icon">${ssrInterpolate(p.category ? p.category.slice(0, 1) : "文")}</span><span class="recommend-body"><span class="recommend-title">${ssrInterpolate(p.title)}</span><span class="recommend-desc">${ssrInterpolate(p.description)}</span><span class="recommend-meta"><span>${ssrInterpolate(p.date)}</span><span class="dot"></span><span class="cat">${ssrInterpolate(p.category)}</span></span></span></a>`);
				});
				_push(`<!--]--></div>`);
			});
			_push(`<!--]--></div></div></div></div></div><section class="latest-articles"><div class="latest-head"><h2>最新文章</h2></div><div class="latest-grid"><!--[-->`);
			ssrRenderList(latest.value, (p) => {
				_push(`<a class="article-card card"${ssrRenderAttr("href", unref(withBase)(p.url))}><div class="article-card-date">${ssrInterpolate(p.date)}</div><h3 class="article-card-title">${ssrInterpolate(p.title)}</h3><p class="article-card-desc">${ssrInterpolate(p.description || p.excerpt)}</p><div class="article-card-tags"><!--[-->`);
				ssrRenderList(p.tags, (t) => {
					_push(`<span class="article-tag">${ssrInterpolate(t)}</span>`);
				});
				_push(`<!--]--></div></a>`);
			});
			_push(`<!--]--></div><div class="latest-more"><a class="latest-more-link"${ssrRenderAttr("href", unref(withBase)("/pages/posts/"))}> 查看全部文章 <svg class="latest-more-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div></section></div></div>`);
		};
	}
};
var _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/HomeLayout.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
//#endregion
//#region .vitepress/theme/components/SiteFooter.vue
var _sfc_main$8 = {
	__name: "SiteFooter",
	__ssrInlineRender: true,
	setup(__props) {
		const { site, theme } = useData$1();
		const year = (/* @__PURE__ */ new Date()).getFullYear();
		const totalWords = theme.value.siteStats?.totalWords ?? 0;
		const wordsText = totalWords >= 1e4 ? `${(totalWords / 1e4).toFixed(1)} 万字` : `${totalWords} 字`;
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<footer${ssrRenderAttrs(mergeProps({ class: "site-footer" }, _attrs))}><div class="container"><p class="footer-text"> © ${ssrInterpolate(unref(year))} ${ssrInterpolate(unref(site).title)} · 托管于 <a href="https://edgeone.ai/zh/products/pages" target="_blank" rel="noopener">EdgeOne Pages</a></p><p class="footer-text"><a${ssrRenderAttr("href", unref(withBase)("/feed.xml"))} target="_blank" rel="noopener">RSS 订阅</a><span class="divider">|</span><span>共计 ${ssrInterpolate(unref(wordsText))}</span><span class="divider">|</span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">京ICP备17074381号-14</a></p></div></footer>`);
		};
	}
};
var _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SiteFooter.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
//#endregion
//#region .vitepress/theme/components/ArticleHeader.vue
var _sfc_main$7 = {
	__name: "ArticleHeader",
	__ssrInlineRender: true,
	setup(__props) {
		const { page, frontmatter } = useData$1();
		const show = computed(() => {
			const p = (page.value.relativePath || "").replace(/\\/g, "/");
			return p.startsWith("articles/") && p.endsWith(".md") && !p.endsWith("/index.md") && p !== "articles/index.md";
		});
		const title = computed(() => frontmatter.value.title || page.value.title || "");
		const meta = computed(() => page.value.articleMeta || null);
		const isDraft = computed(() => !!meta.value?.draft);
		const fmt = (d) => d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? "").slice(0, 10);
		const published = computed(() => meta.value?.published || fmt(frontmatter.value.date) || "");
		const updated = computed(() => meta.value?.updated || "");
		return (_ctx, _push, _parent, _attrs) => {
			if (show.value) {
				_push(`<header${ssrRenderAttrs(mergeProps({ class: "article-header" }, _attrs))} data-v-fe0796dd><h1 class="article-header-title" data-v-fe0796dd>`);
				if (isDraft.value) _push(`<span class="article-header-draft" data-v-fe0796dd>草稿</span>`);
				else _push(`<!---->`);
				_push(`${ssrInterpolate(title.value)}</h1>`);
				if (meta.value) {
					_push(`<div class="article-header-meta" data-v-fe0796dd>`);
					if (published.value) _push(`<span data-v-fe0796dd>发布: ${ssrInterpolate(published.value)}</span>`);
					else _push(`<!---->`);
					if (updated.value) _push(`<span data-v-fe0796dd>更新: ${ssrInterpolate(updated.value)}</span>`);
					else _push(`<!---->`);
					if (meta.value?.words) _push(`<span data-v-fe0796dd>字数: ${ssrInterpolate(meta.value.words)} 字</span>`);
					else _push(`<!---->`);
					if (meta.value?.minutes) _push(`<span data-v-fe0796dd>时长: 约 ${ssrInterpolate(meta.value.minutes)} 分钟</span>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`</header>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/ArticleHeader.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var ArticleHeader_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$7, [["__scopeId", "data-v-fe0796dd"]]);
//#endregion
//#region .vitepress/theme/components/BackToTop.vue
var R = 22;
var _sfc_main$6 = {
	__name: "BackToTop",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter } = useData$1();
		const progress = ref(0);
		const visible = ref(false);
		const isHome = computed(() => frontmatter.value.layout === "home");
		const circumference = 2 * Math.PI * R;
		const dashOffset = ref(circumference);
		let ticking = false;
		function update() {
			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
			const pct = scrollHeight > 0 ? Math.round(scrollTop / scrollHeight * 100) : 0;
			progress.value = Math.max(0, Math.min(100, pct));
			dashOffset.value = circumference * (1 - progress.value / 100);
			visible.value = scrollTop > 200;
		}
		function onScroll() {
			if (!ticking) {
				ticking = true;
				window.requestAnimationFrame(() => {
					update();
					ticking = false;
				});
			}
		}
		onMounted(() => {
			update();
			window.addEventListener("scroll", onScroll, { passive: true });
		});
		onBeforeUnmount(() => {
			window.removeEventListener("scroll", onScroll);
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (visible.value && !isHome.value) _push(`<button${ssrRenderAttrs(mergeProps({
				class: "back-to-top",
				type: "button",
				title: `回到顶部（已阅读 ${progress.value}%）`,
				"aria-label": `回到顶部，已阅读 ${progress.value}%`
			}, _attrs))} data-v-3ae0d791><svg class="btt-ring" viewBox="0 0 52 52" aria-hidden="true" data-v-3ae0d791><circle class="btt-ring-bg" cx="26" cy="26"${ssrRenderAttr("r", R)} data-v-3ae0d791></circle><circle class="btt-ring-fg" cx="26" cy="26"${ssrRenderAttr("r", R)}${ssrRenderAttr("stroke-dasharray", circumference)}${ssrRenderAttr("stroke-dashoffset", dashOffset.value)} data-v-3ae0d791></circle></svg><span class="btt-inner" data-v-3ae0d791><svg class="btt-arrow" viewBox="0 0 16 16" aria-hidden="true" data-v-3ae0d791><path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" data-v-3ae0d791></path></svg><span class="btt-percent" data-v-3ae0d791>${ssrInterpolate(progress.value)}%</span></span></button>`);
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/BackToTop.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var BackToTop_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$6, [["__scopeId", "data-v-3ae0d791"]]);
//#endregion
//#region .vitepress/theme/components/MobileNav.vue
var _sfc_main$5 = {
	__name: "MobileNav",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData$1();
		const route = useRoute();
		const { headers, hasSidebar, isHome } = useLayout();
		const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebarControl();
		const tocOpen = ref(false);
		const isLocked = useBodyScrollLock();
		const outlineLabel = computed(() => {
			const o = theme.value.outline;
			return o && typeof o === "object" && !Array.isArray(o) && o.label || "本文目录";
		});
		const flatHeaders = computed(() => {
			const out = [];
			const walk = (items) => {
				for (const h of items || []) {
					out.push(h);
					if (h.children && h.children.length) walk(h.children);
				}
			};
			walk(headers.value);
			return out;
		});
		const showPanel = computed(() => !isHome.value && hasSidebar.value);
		const showToc = computed(() => flatHeaders.value.length > 0);
		function toggleToc() {
			tocOpen.value = !tocOpen.value;
		}
		function closeToc() {
			tocOpen.value = false;
		}
		function backToTop() {
			window.scrollTo({
				top: 0,
				behavior: "smooth"
			});
		}
		watch(tocOpen, (v) => {
			isLocked.value = v;
		});
		onBeforeUnmount(() => {
			isLocked.value = false;
		});
		watch(() => route.path, closeToc);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_ClientOnly = resolveComponent("ClientOnly");
			_push(ssrRenderComponent(_component_ClientOnly, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (showPanel.value) {
							_push(`<div class="mnp" data-v-4b4bfbf4${_scopeId}>`);
							if (tocOpen.value) _push(`<div class="mnp-mask" data-v-4b4bfbf4${_scopeId}></div>`);
							else _push(`<!---->`);
							if (tocOpen.value) {
								_push(`<aside class="mnp-drawer"${ssrRenderAttr("aria-label", outlineLabel.value)} data-v-4b4bfbf4${_scopeId}><header class="mnp-drawer-head" data-v-4b4bfbf4${_scopeId}><span class="mnp-drawer-title" data-v-4b4bfbf4${_scopeId}>${ssrInterpolate(outlineLabel.value)}</span><button type="button" class="mnp-drawer-close" aria-label="关闭目录" data-v-4b4bfbf4${_scopeId}><svg viewBox="0 0 16 16" aria-hidden="true" data-v-4b4bfbf4${_scopeId}><path d="M3.5 3.5l9 9m0-9l-9 9" data-v-4b4bfbf4${_scopeId}></path></svg></button></header><nav class="mnp-drawer-body" data-v-4b4bfbf4${_scopeId}>`);
								if (flatHeaders.value.length) {
									_push(`<!--[-->`);
									ssrRenderList(flatHeaders.value, (h) => {
										_push(`<a${ssrRenderAttr("href", h.link)} class="${ssrRenderClass(["mnp-link", `mnp-level-${h.level}`])}" data-v-4b4bfbf4${_scopeId}>${ssrInterpolate(h.title)}</a>`);
									});
									_push(`<!--]-->`);
								} else _push(`<p class="mnp-empty" data-v-4b4bfbf4${_scopeId}>暂无目录</p>`);
								_push(`</nav></aside>`);
							} else _push(`<!---->`);
							_push(`<div class="mnp-panel" data-v-4b4bfbf4${_scopeId}><button type="button" class="${ssrRenderClass([{ active: unref(sidebarOpen) }, "mnp-btn"])}" aria-label="展开专题导航" title="专题导航" data-v-4b4bfbf4${_scopeId}><svg class="mnp-icon" viewBox="0 0 256 256" aria-hidden="true" data-v-4b4bfbf4${_scopeId}><path d="M88 48v160H40a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8Z" opacity=".2" data-v-4b4bfbf4${_scopeId}></path><path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 152h16a8 8 0 0 0 0-16H40v-16h16a8 8 0 0 0 0-16H40V88h16a8 8 0 0 0 0-16H40V56h40v144H40Zm176 48H96V56h120z" data-v-4b4bfbf4${_scopeId}></path></svg></button>`);
							if (showToc.value) _push(`<button type="button" class="${ssrRenderClass([{ active: tocOpen.value }, "mnp-btn"])}" aria-label="展开本文目录" title="本文目录" data-v-4b4bfbf4${_scopeId}><svg class="mnp-icon" viewBox="0 0 256 256" aria-hidden="true" data-v-4b4bfbf4${_scopeId}><path d="M184 64v40a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8h96a8 8 0 0 1 8 8m-8 80H40a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8h136a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8" opacity=".2" data-v-4b4bfbf4${_scopeId}></path><path d="M224 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0m-32 24v40a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16m-16 0H80v40h96Zm16 88v40a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16v-40a16 16 0 0 1 16-16h136a16 16 0 0 1 16 16m-16 0H40v40h136Z" data-v-4b4bfbf4${_scopeId}></path></svg></button>`);
							else _push(`<!---->`);
							_push(`<button type="button" class="mnp-btn" aria-label="回到顶部" title="回到顶部" data-v-4b4bfbf4${_scopeId}><svg class="mnp-icon" viewBox="0 0 256 256" aria-hidden="true" data-v-4b4bfbf4${_scopeId}><path d="M205.66 117.66a8 8 0 0 1-11.32 0L136 59.31V216a8 8 0 0 1-16 0V59.31l-58.34 58.35a8 8 0 0 1-11.32-11.32l72-72a8 8 0 0 1 11.32 0l72 72a8 8 0 0 1 0 11.32Z" data-v-4b4bfbf4${_scopeId}></path></svg></button></div></div>`);
						} else _push(`<!---->`);
					} else return [showPanel.value ? (openBlock(), createBlock("div", {
						key: 0,
						class: "mnp"
					}, [
						createVNode(Transition, { name: "mnp-fade" }, {
							default: withCtx(() => [tocOpen.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: "mnp-mask",
								onClick: closeToc
							})) : createCommentVNode("", true)]),
							_: 1
						}),
						createVNode(Transition, { name: "mnp-slide" }, {
							default: withCtx(() => [tocOpen.value ? (openBlock(), createBlock("aside", {
								key: 0,
								class: "mnp-drawer",
								"aria-label": outlineLabel.value
							}, [createVNode("header", { class: "mnp-drawer-head" }, [createVNode("span", { class: "mnp-drawer-title" }, toDisplayString(outlineLabel.value), 1), createVNode("button", {
								type: "button",
								class: "mnp-drawer-close",
								"aria-label": "关闭目录",
								onClick: closeToc
							}, [(openBlock(), createBlock("svg", {
								viewBox: "0 0 16 16",
								"aria-hidden": "true"
							}, [createVNode("path", { d: "M3.5 3.5l9 9m0-9l-9 9" })]))])]), createVNode("nav", { class: "mnp-drawer-body" }, [flatHeaders.value.length ? (openBlock(true), createBlock(Fragment, { key: 0 }, renderList(flatHeaders.value, (h) => {
								return openBlock(), createBlock("a", {
									key: h.link,
									href: h.link,
									class: ["mnp-link", `mnp-level-${h.level}`],
									onClick: closeToc
								}, toDisplayString(h.title), 11, ["href"]);
							}), 128)) : (openBlock(), createBlock("p", {
								key: 1,
								class: "mnp-empty"
							}, "暂无目录"))])], 8, ["aria-label"])) : createCommentVNode("", true)]),
							_: 1
						}),
						createVNode("div", { class: "mnp-panel" }, [
							createVNode("button", {
								type: "button",
								class: ["mnp-btn", { active: unref(sidebarOpen) }],
								"aria-label": "展开专题导航",
								title: "专题导航",
								onClick: unref(toggleSidebar)
							}, [(openBlock(), createBlock("svg", {
								class: "mnp-icon",
								viewBox: "0 0 256 256",
								"aria-hidden": "true"
							}, [createVNode("path", {
								d: "M88 48v160H40a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8Z",
								opacity: ".2"
							}), createVNode("path", { d: "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 152h16a8 8 0 0 0 0-16H40v-16h16a8 8 0 0 0 0-16H40V88h16a8 8 0 0 0 0-16H40V56h40v144H40Zm176 48H96V56h120z" })]))], 10, ["onClick"]),
							showToc.value ? (openBlock(), createBlock("button", {
								key: 0,
								type: "button",
								class: ["mnp-btn", { active: tocOpen.value }],
								"aria-label": "展开本文目录",
								title: "本文目录",
								onClick: toggleToc
							}, [(openBlock(), createBlock("svg", {
								class: "mnp-icon",
								viewBox: "0 0 256 256",
								"aria-hidden": "true"
							}, [createVNode("path", {
								d: "M184 64v40a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8h96a8 8 0 0 1 8 8m-8 80H40a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8h136a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8",
								opacity: ".2"
							}), createVNode("path", { d: "M224 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0m-32 24v40a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16m-16 0H80v40h96Zm16 88v40a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16v-40a16 16 0 0 1 16-16h136a16 16 0 0 1 16 16m-16 0H40v40h136Z" })]))], 2)) : createCommentVNode("", true),
							createVNode("button", {
								type: "button",
								class: "mnp-btn",
								"aria-label": "回到顶部",
								title: "回到顶部",
								onClick: backToTop
							}, [(openBlock(), createBlock("svg", {
								class: "mnp-icon",
								viewBox: "0 0 256 256",
								"aria-hidden": "true"
							}, [createVNode("path", { d: "M205.66 117.66a8 8 0 0 1-11.32 0L136 59.31V216a8 8 0 0 1-16 0V59.31l-58.34 58.35a8 8 0 0 1-11.32-11.32l72-72a8 8 0 0 1 11.32 0l72 72a8 8 0 0 1 0 11.32Z" })]))])
						])
					])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/MobileNav.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var MobileNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$5, [["__scopeId", "data-v-4b4bfbf4"]]);
//#endregion
//#region .vitepress/theme/components/TwikooComment.vue
var twikooPromise = null;
function getTwikoo() {
	return window.twikoo && typeof window.twikoo.init === "function" ? window.twikoo : null;
}
function loadTwikooScript() {
	if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("SSR"));
	const existing = getTwikoo();
	if (existing) return Promise.resolve(existing);
	if (!twikooPromise) twikooPromise = new Promise((resolve, reject) => {
		const s = document.createElement("script");
		s.src = "https://registry.npmmirror.com/twikoo/2.0.9/files/dist/twikoo.min.js";
		s.crossOrigin = "anonymous";
		s.onload = () => {
			const twikoo = getTwikoo();
			if (twikoo) resolve(twikoo);
			else {
				twikooPromise = null;
				reject(/* @__PURE__ */ new Error("twikoo 脚本加载后全局对象不可用"));
			}
		};
		s.onerror = () => {
			twikooPromise = null;
			reject(/* @__PURE__ */ new Error("twikoo 脚本加载失败"));
		};
		document.head.appendChild(s);
	});
	return twikooPromise;
}
var _sfc_main$4 = {
	__name: "TwikooComment",
	__ssrInlineRender: true,
	setup(__props) {
		const { page, frontmatter, isDark } = useData$1();
		const route = useRoute();
		const envId = "https://twikoo.wyclab.com";
		const container = ref(null);
		const show = computed(() => {
			if (frontmatter.value.comment === false) return false;
			const p = (page.value.relativePath || "").replace(/\\/g, "/");
			if (p.startsWith("articles/") && !p.endsWith("/index.md") && p !== "articles/index.md") return true;
			return p === "pages/about.md" || p === "pages/friend.md";
		});
		function init() {
			if (typeof window === "undefined") return;
			loadTwikooScript().then((twikoo) => {
				if (!twikoo || !container.value) return;
				twikoo.init({
					envId,
					el: "#twikoo",
					path: window.location.pathname,
					lang: "zh-CN"
				});
			}).catch((err) => console.warn("[twikoo] 初始化失败:", err));
		}
		onMounted(() => {
			if (show.value) init();
		});
		watch(() => route.path, () => {
			if (show.value) init();
		}, { flush: "post" });
		return (_ctx, _push, _parent, _attrs) => {
			if (show.value) _push(`<div${ssrRenderAttrs(mergeProps({
				id: "twikoo",
				ref_key: "container",
				ref: container,
				class: "twikoo-comment",
				"data-theme": unref(isDark) ? "dark" : "light"
			}, _attrs))} data-v-12e29250></div>`);
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/TwikooComment.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var TwikooComment_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$4, [["__scopeId", "data-v-12e29250"]]);
//#endregion
//#region .vitepress/theme/Layout.vue
var _sfc_main$3 = {
	__name: "Layout",
	__ssrInlineRender: true,
	setup(__props) {
		const { Layout } = theme;
		const { frontmatter } = useData$1();
		function syncNavState() {
			document.documentElement.classList.toggle("nav-floating", window.scrollY > 8);
		}
		onMounted(() => {
			syncNavState();
			window.addEventListener("scroll", syncNavState, { passive: true });
		});
		onBeforeUnmount(() => window.removeEventListener("scroll", syncNavState));
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Layout), null, {
				"home-hero-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(frontmatter).layout === "home") _push(ssrRenderComponent(_sfc_main$9, null, null, _parent, _scopeId));
						else _push(`<!---->`);
					} else return [unref(frontmatter).layout === "home" ? (openBlock(), createBlock(_sfc_main$9, { key: 0 })) : createCommentVNode("", true)];
				}),
				"layout-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(_sfc_main$8, null, null, _parent, _scopeId));
					else return [createVNode(_sfc_main$8)];
				}),
				"doc-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(ArticleHeader_default, null, null, _parent, _scopeId));
					else return [createVNode(ArticleHeader_default)];
				}),
				"doc-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(TwikooComment_default, null, null, _parent, _scopeId));
					else return [createVNode(TwikooComment_default)];
				}),
				"page-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(TwikooComment_default, null, null, _parent, _scopeId));
					else return [createVNode(TwikooComment_default)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(BackToTop_default, null, null, _parent));
			_push(ssrRenderComponent(MobileNav_default, null, null, _parent));
			_push(`<!--]-->`);
		};
	}
};
var _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/Layout.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
//#endregion
//#region .vitepress/theme/components/PostsList.vue
var _sfc_main$2 = {
	__name: "PostsList",
	__ssrInlineRender: true,
	setup(__props) {
		const grouped = computed(() => {
			const map = /* @__PURE__ */ new Map();
			for (const p of data) {
				const year = p.date.slice(0, 4) || "未分类";
				if (!map.has(year)) map.set(year, []);
				map.get(year).push(p);
			}
			return [...map.entries()].map(([year, list]) => ({
				year,
				list
			}));
		});
		const mmdd = (d) => d.slice(5);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				id: "main",
				class: "posts-page"
			}, _attrs))}><div class="title"><h1>全部文章</h1></div><div id="post"><!--[-->`);
			ssrRenderList(grouped.value, (g) => {
				_push(`<div class="year-section"><h2 class="year-title">${ssrInterpolate(g.year)}</h2><!--[-->`);
				ssrRenderList(g.list, (p) => {
					_push(`<div class="post-item"><div class="post-date">${ssrInterpolate(mmdd(p.date))}</div><div class="post-main"><a${ssrRenderAttr("href", unref(withBase)(p.url))} class="post-title">${ssrInterpolate(p.title)}</a>`);
					if (p.category) _push(`<span class="post-category">${ssrInterpolate(p.category)}</span>`);
					else _push(`<!---->`);
					_push(`</div></div>`);
				});
				_push(`<!--]--></div>`);
			});
			_push(`<!--]-->`);
			if (!unref(data).length) _push(`<div class="no-posts">暂无文章</div>`);
			else _push(`<!---->`);
			_push(`</div></div>`);
		};
	}
};
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/PostsList.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
//#endregion
//#region .vitepress/theme/components/TagsPage.vue
var _sfc_main$1 = {
	__name: "TagsPage",
	__ssrInlineRender: true,
	setup(__props) {
		const ICON_PATHS = {
			tag: ["M256 128v698.88l196.032-156.864a96 96 0 0 1 119.936 0L768 826.816V128zm-32-64h576a32 32 0 0 1 32 32v797.44a32 32 0 0 1-51.968 24.96L531.968 720a32 32 0 0 0-39.936 0L243.968 918.4A32 32 0 0 1 192 893.44V96a32 32 0 0 1 32-32"],
			cpu: ["M320 256a64 64 0 0 0-64 64v384a64 64 0 0 0 64 64h384a64 64 0 0 0 64-64V320a64 64 0 0 0-64-64zm0-64h384a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128H320a128 128 0 0 1-128-128V320a128 128 0 0 1 128-128", "M512 64a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m160 0a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m-320 0a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m160 896a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32m160 0a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32m-320 0a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32M64 512a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m0-160a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m0 320a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m896-160a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32m0-160a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32m0 320a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32"],
			link: ["M715.648 625.152 670.4 579.904l90.496-90.56c75.008-74.944 85.12-186.368 22.656-248.896-62.528-62.464-173.952-52.352-248.96 22.656L444.16 353.6l-45.248-45.248 90.496-90.496c100.032-99.968 251.968-110.08 339.456-22.656 87.488 87.488 77.312 239.424-22.656 339.456l-90.496 90.496zm-90.496 90.496-90.496 90.496C434.624 906.112 282.688 916.224 195.2 828.8c-87.488-87.488-77.312-239.424 22.656-339.456l90.496-90.496 45.248 45.248-90.496 90.56c-75.008 74.944-85.12 186.368-22.656 248.896 62.528 62.464 173.952 52.352 248.96-22.656l90.496-90.496zm0-362.048 45.248 45.248L398.848 670.4 353.6 625.152z"],
			operation: ["M389.44 768a96.064 96.064 0 0 1 181.12 0H896v64H570.56a96.064 96.064 0 0 1-181.12 0H128v-64zm192-288a96.064 96.064 0 0 1 181.12 0H896v64H762.56a96.064 96.064 0 0 1-181.12 0H128v-64zm-320-288a96.064 96.064 0 0 1 181.12 0H896v64H442.56a96.064 96.064 0 0 1-181.12 0H128v-64z"],
			monitor: ["M544 768v128h192a32 32 0 1 1 0 64H288a32 32 0 1 1 0-64h192V768H192A128 128 0 0 1 64 640V256a128 128 0 0 1 128-128h640a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128zM192 192a64 64 0 0 0-64 64v384a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64z"],
			message: ["M128 224v512a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V224zm0-64h768a64 64 0 0 1 64 64v512a128 128 0 0 1-128 128H192A128 128 0 0 1 64 736V224a64 64 0 0 1 64-64", "M904 224 656.512 506.88a192 192 0 0 1-289.024 0L120 224zm-698.944 0 210.56 240.704a128 128 0 0 0 192.704 0L818.944 224z"],
			document: ["M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z"],
			editPen: ["m199.04 672.64 193.984 112 224-387.968-193.92-112-224 388.032zm-23.872 60.16 32.896 148.288 144.896-45.696zM455.04 229.248l193.92 112 56.704-98.112-193.984-112zM104.32 708.8l384-665.024 304.768 175.936L409.152 884.8h.064l-248.448 78.336zm384 254.272v-64h448v64z"],
			connection: ["M640 384v64H448a128 128 0 0 0-128 128v128a128 128 0 0 0 128 128h320a128 128 0 0 0 128-128V576a128 128 0 0 0-64-110.848V394.88c74.56 26.368 128 97.472 128 181.056v128a192 192 0 0 1-192 192H448a192 192 0 0 1-192-192V576a192 192 0 0 1 192-192z", "M384 640v-64h192a128 128 0 0 0 128-128V320a128 128 0 0 0-128-128H256a128 128 0 0 0-128 128v128a128 128 0 0 0 64 110.848v70.272A192.06 192.06 0 0 1 64 448V320a192 192 0 0 1 192-192h320a192 192 0 0 1 192 192v128a192 192 0 0 1-192 192z"],
			platform: ["M448 832v-64h128v64h192v64H256v-64zM128 704V128h768v576z"]
		};
		const TAG_ICON = {
			AI: "cpu",
			Agent: "connection",
			Python: "monitor",
			Microsoft: "platform",
			OAuth: "link",
			邮件: "message",
			工程化: "operation",
			编程: "editPen",
			JavaScript: "editPen",
			TypeScript: "editPen",
			Vue: "operation",
			博客: "document"
		};
		const CATEGORY_ICON = {
			前端: "document",
			随笔: "editPen",
			项目: "monitor",
			笔记: "document"
		};
		const iconForTag = (tag) => ICON_PATHS[TAG_ICON[tag] || "tag"];
		const iconForCategory = (cat) => ICON_PATHS[CATEGORY_ICON[cat] || "document"];
		const tagStats = computed(() => {
			const map = /* @__PURE__ */ new Map();
			for (const p of data) for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1);
			return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({
				tag,
				count
			}));
		});
		const activeTag = ref(tagStats.value[0]?.tag || "");
		const filtered = computed(() => activeTag.value ? data.filter((p) => p.tags.includes(activeTag.value)) : []);
		function readQuery() {
			const q = new URLSearchParams(window.location.search).get("q");
			const valid = q && tagStats.value.some((s) => s.tag === q);
			activeTag.value = valid ? q : tagStats.value[0]?.tag || "";
		}
		onMounted(() => {
			readQuery();
			window.addEventListener("popstate", readQuery);
		});
		onBeforeUnmount(() => window.removeEventListener("popstate", readQuery));
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				id: "main",
				class: "tags-page"
			}, _attrs))}><section class="tags-section"><div class="section-heading"><h1>标签列表</h1><span>共 ${ssrInterpolate(tagStats.value.length)} 个标签</span></div><div class="tag-panel"><!--[-->`);
			ssrRenderList(tagStats.value, (s) => {
				_push(`<button type="button" class="${ssrRenderClass([{ "is-active": activeTag.value === s.tag }, "tag-button"])}"${ssrRenderAttr("aria-pressed", activeTag.value === s.tag)}><svg class="tag-icon" viewBox="0 0 1024 1024" aria-hidden="true"><!--[-->`);
				ssrRenderList(iconForTag(s.tag), (d, i) => {
					_push(`<path fill="currentColor"${ssrRenderAttr("d", d)}></path>`);
				});
				_push(`<!--]--></svg><span class="tag-name">${ssrInterpolate(s.tag)}</span><span class="tag-count">${ssrInterpolate(s.count)}</span></button>`);
			});
			_push(`<!--]--></div></section>`);
			if (filtered.value.length) {
				_push(`<section class="articles-section"><div class="article-divider"><h2>${ssrInterpolate(activeTag.value)} <span>- ${ssrInterpolate(filtered.value.length)} 篇</span></h2></div><div class="article-grid"><!--[-->`);
				ssrRenderList(filtered.value, (p) => {
					_push(`<article class="article-card"><div class="article-card-head"><time>${ssrInterpolate(p.date)}</time><svg class="article-icon" viewBox="0 0 1024 1024" aria-hidden="true"><!--[-->`);
					ssrRenderList(iconForCategory(p.category), (d, i) => {
						_push(`<path fill="currentColor"${ssrRenderAttr("d", d)}></path>`);
					});
					_push(`<!--]--></svg></div><a${ssrRenderAttr("href", unref(withBase)(p.url))} class="article-link"><h3>${ssrInterpolate(p.title)}</h3></a><p>${ssrInterpolate(p.description || "暂无摘要")}</p><div class="article-tags"><!--[-->`);
					ssrRenderList(p.tags, (t) => {
						_push(`<button type="button" class="${ssrRenderClass({ "is-active": t === activeTag.value })}"> # ${ssrInterpolate(t)}</button>`);
					});
					_push(`<!--]--></div></article>`);
				});
				_push(`<!--]--></div></section>`);
			} else _push(`<div class="no-posts">暂无文章</div>`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/TagsPage.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
//#endregion
//#region .vitepress/theme/components/FriendPage.vue
var _sfc_main = {
	__name: "FriendPage",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter } = useData$1();
		const friendPage = computed(() => frontmatter.value.friendPage || {});
		const desc = computed(() => friendPage.value.desc || "收集一些喜欢的站点与朋友们的博客。");
		const defaultAvatar = computed(() => friendPage.value.defaultAvatar || "/logo.png");
		const friends = computed(() => frontmatter.value.friends || []);
		const keyword = ref("");
		const normalize = (s) => String(s || "").trim();
		const hostOf = (url) => {
			try {
				return new URL(url).host;
			} catch {
				return url;
			}
		};
		const list = computed(() => friends.value.map((f) => ({
			...f,
			name: normalize(f.name) || hostOf(f.url),
			desc: normalize(f.desc) || "欢迎访问这位朋友的网站。",
			avatar: normalize(f.avatar) || defaultAvatar.value,
			host: hostOf(f.url)
		})));
		const total = computed(() => list.value.length);
		const filtered = computed(() => {
			const k = keyword.value.trim().toLowerCase();
			if (!k) return list.value;
			return list.value.filter((f) => [
				f.name,
				f.desc,
				f.url,
				f.host
			].some((v) => String(v || "").toLowerCase().includes(k)));
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "friend-page" }, _attrs))}><div class="friend-intro"><div class="friend-intro-body"><div class="friend-intro-text"><h1>友链</h1><p>${ssrInterpolate(desc.value)}</p><span class="friend-count">共 ${ssrInterpolate(total.value)} 个站点</span></div><input${ssrRenderAttr("value", keyword.value)} type="text" placeholder="搜索站点（名称/描述）" class="friend-search"></div></div><div class="friend-grid"><!--[-->`);
			ssrRenderList(filtered.value, (f, i) => {
				_push(`<a class="friend-card"${ssrRenderAttr("href", f.url)} target="_blank" rel="noopener noreferrer"><div class="friend-card-top"><div class="friend-avatar"><img${ssrRenderAttr("src", f.avatar)}${ssrRenderAttr("alt", f.name)} loading="lazy"></div><div class="friend-card-info"><h3>${ssrInterpolate(f.name)}</h3><p>${ssrInterpolate(f.desc)}</p></div></div>`);
				if (f.tags && f.tags.length) {
					_push(`<div class="friend-tags"><!--[-->`);
					ssrRenderList(f.tags.slice(0, 6), (t, ti) => {
						_push(`<span>${ssrInterpolate(t)}</span>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<!---->`);
				_push(`</a>`);
			});
			_push(`<!--]--></div>`);
			if (!filtered.value.length) _push(`<div class="friend-empty"><div class="friend-empty-emoji">🧩</div><p>没有匹配的友链</p><p>试试换个关键词，或检查 frontmatter 配置。</p></div>`);
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/FriendPage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
//#region .vitepress/theme/index.ts
var theme_default = {
	extends: theme,
	Layout: _sfc_main$3,
	enhanceApp({ app }) {
		app.component("PostsList", _sfc_main$2);
		app.component("TagsPage", _sfc_main$1);
		app.component("FriendPage", _sfc_main);
		if (typeof window !== "undefined") {
			const KEY = "vitepress-theme-appearance";
			const mql = window.matchMedia("(prefers-color-scheme: dark)");
			const apply = (e) => {
				const manual = localStorage.getItem(KEY);
				if (!manual || manual === "auto") document.documentElement.classList.toggle("dark", e.matches);
			};
			try {
				mql.addEventListener("change", apply);
			} catch {
				mql.addListener?.(apply);
			}
		}
	}
};
//#endregion
//#region node_modules/vitepress/dist/client/app/index.js
function resolveThemeExtends(theme) {
	if (theme.extends) {
		const base = resolveThemeExtends(theme.extends);
		return {
			...base,
			...theme,
			async enhanceApp(ctx) {
				await base.enhanceApp?.(ctx);
				await theme.enhanceApp?.(ctx);
			},
			setup() {
				base.setup?.();
				theme.setup?.();
			}
		};
	}
	return theme;
}
var Theme = resolveThemeExtends(theme_default);
var VitePressApp = defineComponent({
	name: "VitePressApp",
	setup() {
		const { site, lang, dir } = useData$1();
		onMounted(() => {
			watchEffect(() => {
				document.documentElement.lang = lang.value;
				document.documentElement.dir = dir.value;
			});
		});
		if (site.value.router.prefetchLinks) usePrefetch();
		useCopyCode();
		useCodeGroups();
		if (Theme.setup) Theme.setup();
		return () => h(Theme.Layout);
	}
});
async function createApp$1() {
	globalThis.__VITEPRESS__ = true;
	const router = newRouter();
	const app = newApp();
	app.provide(RouterSymbol, router);
	const data = initData(router.route);
	app.provide(dataSymbol, data);
	app.component("Content", Content);
	app.component("ClientOnly", ClientOnly);
	Object.defineProperties(app.config.globalProperties, {
		$frontmatter: { get() {
			return data.frontmatter.value;
		} },
		$params: { get() {
			return data.page.value.params;
		} }
	});
	app.config.throwUnhandledErrorInProduction = true;
	if (Theme.enhanceApp) await Theme.enhanceApp({
		app,
		router,
		siteData: siteDataRef
	});
	return {
		app,
		router,
		data
	};
}
function newApp() {
	return createSSRApp(VitePressApp);
}
function newRouter() {
	let isInitialPageLoad = inBrowser;
	return createRouter((path) => {
		let pageFilePath = pathToFile(path);
		let pageModule = null;
		if (pageFilePath) {
			if (isInitialPageLoad) pageFilePath = pageFilePath.replace(/\.js$/, ".lean.js");
			pageModule = import(
				/*@vite-ignore*/
				pageFilePath
);
		}
		if (inBrowser) isInitialPageLoad = false;
		return pageModule;
	}, Theme.NotFound);
}
if (inBrowser) createApp$1().then(({ app, router, data }) => {
	router.go(location.href, { initialLoad: true }).then(() => {
		useUpdateHead(router.route, data.site);
		app.mount("#app");
	});
});
//#endregion
//#region node_modules/vitepress/dist/client/app/ssr.js
async function render(path) {
	const { app, router } = await createApp$1();
	await router.go(path);
	const ctx = {
		content: "",
		vpIcons: /* @__PURE__ */ new Set()
	};
	ctx.content = await renderToString(app, ctx);
	return ctx;
}
//#endregion
export { withBase as a, pathToFile as i, useData as n, dataSymbol as o, useRouter as r, render, escapeRegExp as s, useBodyScrollLock as t };
