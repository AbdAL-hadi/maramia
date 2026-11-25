import { Hero } from '../sections/Hero'
import { Story } from '../sections/Story'
import { SignatureDishes } from '../sections/SignatureDishes'
import { UaeExperience } from '../sections/UaeExperience'
import { Hospitality } from '../sections/Hospitality'
import { DiningOffers } from '../sections/DiningOffers'
import { HomeRewards } from '../sections/HomeRewards'

export function HomePage() {
  return (
    <>
      <Hero />
      <Story />
      <SignatureDishes />
      <UaeExperience />
      <Hospitality />
      <DiningOffers />
      <HomeRewards />
    </>
  )
}
