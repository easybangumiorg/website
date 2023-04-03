module.exports = {
	dest: "./dist",

	title: "EasyBangumi",
	description: "Free and open source bangumi(animation) player for Android",

    head: [
		["link", { rel: "icon", href: "/favicon.ico" }],
		["meta", { name: "theme-color", content: "#343D48" }],
		["meta", { prefix: "og: http://ogp.me/ns#", property: "og:image", content: "https://easybangumi.org/icons/FAVICON-RAW.png" }],
		['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
	],

	themeConfig: {
		logo: "/icons/logo.ico",
		repo: "easybangumiorg/easybangumi",
		docsRepo: "easybangumiorg/website",
		docsBranch: 'main',
		docsDir: "src",
		smoothScroll: true,
		searchPlaceholder: "Search...",
		editLinks: true,
		editLinkText: "Help us improve this page",
		lastUpdated: "Last updated",
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Download", link: "/download/" },
		],
	},

  }