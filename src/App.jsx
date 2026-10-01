import Header from './components/Header'
import Hero from './components/Hero'
import InfoStrip from './components/InfoStrip'
import AboutSlider from './components/AboutSlider'
import Areas from './components/Areas'
import Description from './components/Description'
import Metrics from './components/Metrics'
import Masterplan from './components/Masterplan'
import MasterplanList from './components/MasterplanList'
import Infrastructure from './components/Infrastructure'
import Benefits from './components/Benefits'
import RegisterForm from './components/RegisterForm'
import Footer from './components/Footer'
import { useLenis } from './hooks'

import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/chrome.css'
import './styles/sections.css'

export default function App() {
  useLenis()

  return (
    <>
      <Header />
      {/* the hero is flush to the top of the document — its own padding-top
          (8.89vw) clears the fixed bar, so no spacer is needed here */}
      <main className="sections">
        <Hero />
        <InfoStrip />
        <div className="sections">
          <AboutSlider>
            <Areas />
          </AboutSlider>
          <Description />
          <Metrics />
          <Masterplan />
          <MasterplanList />
          <Infrastructure />
          <Benefits />
        </div>
        <section className="section pt-176 clip">
          <div className="container">
            <RegisterForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
