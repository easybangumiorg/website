<script>
import { marked } from 'marked'
import { mapState } from "vuex";

export default {
	computed: {
		...mapState(['stable', 'nightly']),

		stableBody() {
			let body = this.stable && this.stable.data && this.stable.data.body
			if (!body) {
				return '加载中...'
			}
			body = body.split('\r\n')
			for (let i = 0; i < body.length; i++) {
				if (i > 0) {
					body[i] = `- ${body[i]}`
				}
			}
			return marked.parse(body.join('\r\n'))
		}
	}
};
</script>

<template>
	<div class="guide whatsNew">
		<p class="title">
			更新日志
		</p>
		<div v-html="stableBody"></div>
		<div class="note">
			<p>
				在
				<a href="https://github.com/easybangumiorg/easybangumi/releases/latest" target="_blank" rel="noopener">
					GitHub
				</a>
				上查看
			</p>
		</div>
	</div>
</template>

<style lang="scss">
.whatsNew {
	.title {
		text-align: center;
	}

	div {
		white-space: normal;

		h3 {
			font-size: 1.1rem;
		}
	}
}

.note {
	font-size: .9rem;
	text-align: right;
}

.guide {
	background-color: #f0f4f83b;
	border-radius: 0.4rem;
	margin: 1rem 0;
	padding: 0.1rem 1.5rem;

	.title {
		font-weight: bold;
	}

	.videolink {
		margin-top: -1rem;
	}
}
</style>