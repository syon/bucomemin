<template>
  <section class="container">
    <div>
      <img :class="$style.avatar" :src="avatarUrl" />
      <h1>{{ user }}</h1>

      <hr />

      <h1 class="totalStars">★ {{ count.total }}</h1>
      <button @click="order">order</button>

      <hr />

      <Circle
        :percent="commentRate"
        :size="80"
        dashboard
        stroke-color="#03a3de"
      >
        <span style="font-size:18px">{{ commentRate }}%</span>
      </Circle>
      <Circle
        :percent="starredRate"
        :size="80"
        dashboard
        stroke-color="#f5a623"
      >
        <span style="font-size:18px">{{ starredRate }}%</span>
      </Circle>
      <Circle :percent="anondRate" :size="80" dashboard stroke-color="#5279E7">
        <span style="font-size:18px">{{ anondRate }}%</span>
      </Circle>

      <hr />

      <div id="cal-heatmap"></div>

      <hr />

      <div v-for="(s, i) in sparkles" :key="i" href="#" class="sparkles">
        <p>{{ s.comment }}</p>
        <div>★ {{ s.stars.length }}</div>
      </div>

      <hr />

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
import debug from 'debug'
import { mapState } from 'vuex'

const dg = debug('app:id/_id')

export default {
  data() {
    return {
      datasetUrl: '',
      count: {},
      favorites: []
    }
  },
  computed: {
    ...mapState('profile', {
      commentRate: state => state.commentRate,
      starredRate: state => state.starredRate,
      anondRate: state => state.anondRate,
      sparkles: state => state.sparkles
    }),
    avatarUrl() {
      return Hatena.User.getProfileImageURL(this.user)
    }
  },
  asyncData({ params, store }) {
    dg('[#asyncData]', { params })
    const { id } = params
    return { user: id }
  },
  mounted() {
    // Wait DOM Rendering
    this.$nextTick(() => {
      dg('mounted() / $nextTick')
      // eslint-disable-next-line nuxt/no-env-in-hooks
      if (process.browser) {
        this.refresh()
      }
    })
  },
  methods: {
    async refresh() {
      this.getTotalStars()
      this.getFavorites()
      const user = this.user
      await this.$store.dispatch('profile/fetchDataset', { user })
      const u = await this.$store.dispatch('profile/detectDatasetURL', { user })
      this.datasetUrl = u
      this.drawHeatmap()
    },
    async order() {
      const user = this.user
      await this.$store.dispatch('profile/addOrder', { user })
    },
    drawHeatmap() {
      if (!process.browser) {
        return
      }
      const cal = new window.CalHeatMap()
      if (!this.datasetUrl) return
      const now = new Date()
      cal.init({
        domain: 'month',
        subDomain: 'day',
        range: 12,
        start: new Date(now.getFullYear(), now.getMonth() - 11),
        weekStartOnMonday: false,
        cellSize: 10,
        cellPadding: 1,
        data: this.datasetUrl,
        legend: [1, 5, 10],
        displayLegend: false,
        domainLabelFormat: '',
        domainGutter: 0,
        tooltip: true
      })
    },
    async getTotalStars() {
      const uri = `http://b.hatena.ne.jp/${this.user}/`
      const res = await Hatena.Star.getTotalCount({ uri })
      dg('[#Hatena.Star.getTotalCount]', res)
      this.count = res.count
      this.count.total = res.star_count
    },
    async getFavorites() {
      const res = await Hatena.User.getFavorites(this.user)
      dg('[#Hatena.User.getFavorites]', res)
      this.favorites = res.favorites
    }
  }
}
</script>

<style module>
.avatar {
  width: 96px;
  height: 96px;
  border-radius: 3px;
}
</style>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

hr {
  margin: 2rem 0;
  border: 0;
}

.fav {
  padding: 2px 4px;
}

.totalStars {
  color: #f5a623;
}

#cal-heatmap {
  display: flex;
  justify-content: center;
  min-height: 76px;
}
.cal-heatmap-container .q0 {
  fill: hsl(360, 14%, 93%); /* hsl(216, 14%, 93%) */
}
.cal-heatmap-container .q1 {
  fill: hsl(224, 62%, 72%); /* hsl(80, 62%, 72%) */
}
.cal-heatmap-container .q2 {
  fill: hsl(256, 45%, 61%); /* hsl(112, 45%, 61%) */
}
.cal-heatmap-container .q3 {
  fill: hsl(276, 63%, 37%); /* hsl(132, 63%, 37%) */
}
.cal-heatmap-container .q4 {
  fill: hsl(276, 59%, 24%); /* hsl(132, 59%, 24%) */
}
</style>
