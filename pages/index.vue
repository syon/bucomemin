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
      <div>
        <a v-for="f in favorites" :key="f.name" href="#" class="fav">
          {{ f.name }}
        </a>
      </div>
    </div>
  </section>
</template>

<script>
import Hatena from 'js-hatena'

export default {
  data() {
    return {
      count: {},
      favorites: []
    }
  },
  computed: {
    avatarUrl() {
      const userId = 'Dy66'
      return Hatena.User.getProfileImageURL(userId)
    }
  },
  mounted() {
    this.getTotalStars()
    this.getFavorites()
  },
  methods: {
    async getTotalStars() {
      const userId = 'Dy66'
      const uri = `http://b.hatena.ne.jp/${userId}/`
      const res = await Hatena.Star.getTotalCount({ uri })
      this.count = res.count
      this.count.total = res.star_count
    },
    async getFavorites() {
      const userId = 'Dy66'
      const res = await Hatena.User.getFavorites(userId)
      this.favorites = res.favorites
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

.fav {
  padding: 2px 4px;
}
</style>
