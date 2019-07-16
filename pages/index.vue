<template>
  <section class="container">
    <div>
      <img :src="avatarUrl" />
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
import { mapState } from 'vuex'

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
      user: 'aukusoe',
      datasetUrl: '',
      count: {},
      favorites: []
    }
  },
  computed: {
    ...mapState('profile', {
      commentRate: state => state.commentRate,
      starredRate: state => state.starredRate,
      anondRate: state => state.anondRate
    }),
    avatarUrl() {
      return Hatena.User.getProfileImageURL(this.user)
    }
  },
  async mounted() {
    this.getTotalStars()
    this.getFavorites()
    const datasetUrl = await this.$store.dispatch('profile/detectDatasetURL', {
      user: this.user
    })
    this.datasetUrl = datasetUrl
    this.drawHeatmap()
  },
  methods: {
    async order() {
      const user = this.user
      await this.$store.dispatch('profile/addOrder', { user })
    },
    drawHeatmap() {
      const cal = new window.CalHeatMap()
      const now = new Date()
      if (!this.datasetUrl) return
      cal.init({
        domain: 'month',
        subDomain: 'day',
        range: 12,
        start: new Date(now.getFullYear(), now.getMonth() - 11),
        weekStartOnMonday: false,
        cellSize: 10,
        cellPadding: 1,
        data: this.datasetUrl,
        afterLoadData: this.parser,
        legend: [1, 5, 10],
        displayLegend: false,
        domainLabelFormat: '',
        domainGutter: 0,
        tooltip: true
      })
    },
    parser(data) {
      const stats = {}
      const calendarData = data.calendarData
      Object.entries(calendarData).forEach(([k, v]) => {
        const timestamp = new Date(k).getTime() / 1000
        stats[timestamp] = v
      })
      return stats
    },
    async getTotalStars() {
      const uri = `http://b.hatena.ne.jp/${this.user}/`
      const res = await Hatena.Star.getTotalCount({ uri })
      this.count = res.count
      this.count.total = res.star_count
    },
    async getFavorites() {
      const res = await Hatena.User.getFavorites(this.user)
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
