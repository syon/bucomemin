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
      <div id="cal-heatmap"></div>
    </div>
  </section>
</template>

<script>
import Hatena from 'js-hatena'

export default {
  head() {
    return {
      script: [
        { src: '//d3js.org/d3.v3.min.js' },
        { src: '//cdn.jsdelivr.net/cal-heatmap/3.3.10/cal-heatmap.min.js' },
        { src: '' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: '//cdn.jsdelivr.net/cal-heatmap/3.3.10/cal-heatmap.css'
        }
      ]
    }
  },
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
    this.$store.dispatch('profile/load', { user: 'Dy66 ' })
    this.drawHeatmap()
  },
  methods: {
    drawHeatmap() {
      const cal = new window.CalHeatMap()
      cal.init({
        domain: 'year',
        subDomain: 'day',
        range: 1,
        weekStartOnMonday: false,
        cellSize: 12,
        cellPadding: 3,
        data: '/data.json',
        afterLoadData: this.parser,
        legend: [1, 5, 10],
        tooltip: true
      })
    },
    parser(data) {
      const stats = {}
      Object.entries(data).forEach(([k, v]) => {
        const timestamp = new Date(k).getTime() / 1000
        stats[timestamp] = v
      })
      return stats
    },
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

.graph-rect.q0 {
  fill: hsl(360, 14%, 93%); /* hsl(216, 14%, 93%) */
}
.graph-rect.q1 {
  fill: hsl(224, 62%, 72%); /* hsl(80, 62%, 72%) */
}
.graph-rect.q2 {
  fill: hsl(256, 45%, 61%); /* hsl(112, 45%, 61%) */
}
.graph-rect.q3 {
  fill: hsl(276, 63%, 37%); /* hsl(132, 63%, 37%) */
}
.graph-rect.q4 {
  fill: hsl(276, 59%, 24%); /* hsl(132, 59%, 24%) */
}
</style>
