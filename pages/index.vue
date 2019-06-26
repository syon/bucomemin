<template>
  <section class="container">
    <div>
      <img :src="avatarUrl" />
      <h1 class="title">
        {{ count.total }}
      </h1>
      <h2 class="subtitle">
        My groovy Nuxt.js project
      </h2>
      <div class="links">
        <a href="https://nuxtjs.org/" target="_blank" class="button--green"
          >Documentation</a
        >
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          class="button--grey"
          >GitHub</a
        >
      </div>
    </div>
  </section>
</template>

<script>
import Hatena from 'js-hatena'

export default {
  data() {
    return {
      count: {}
    }
  },
  computed: {
    avatarUrl() {
      const userId = 'Dy66'
      // return `https://cdn.profile-image.st-hatena.com/users/${userId}/profile.gif`
      return Hatena.User.getProfileImageURL(userId)
    }
  },
  mounted() {
    this.getTotalStars()
  },
  methods: {
    async getTotalStars() {
      const userId = 'Dy66'
      const uri = `http://b.hatena.ne.jp/${userId}/`
      const res = await Hatena.Star.getTotalCount({ uri })
      console.log({ res })
      this.count = res.count
      this.count.total = res.star_count
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
