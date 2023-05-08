<script>
import { marked } from 'marked'
import { mapState } from "vuex";

export default {
	computed: {
		...mapState(['stable', 'nightly']),

		stableBody() {
			const body = this.stable && this.stable.data && this.stable.data.body
			if (!body) {
				return 'loading...'
			}
			return marked(body).replace(
				/(?<=\(|(, ))@(.*?)(?=\)|(, ))/g,
				"<a href='https://github.com/$2' target='_blank' rel='noopener'>@$2</a>"
			)
		}
	}
};
</script>

<template>
	<div class="guide whatsNew">
		<p class="title">
			What's new
		</p>
		<div v-html="stableBody"></div>
		<div class="note">
			<p>
				View the full release
				<a href="https://github.com/easybangumiorg/easybangumi/releases/latest" target="_blank" rel="noopener">
					here
				</a>
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
	color: rgba(0, 0, 0, .4);
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