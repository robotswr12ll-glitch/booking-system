import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Icon, IconName } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { SPORTS } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

const sportImages: Record<(typeof SPORTS)[number], string> = {
  Basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
  Football: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  Tennis: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
  Badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
  Swimming: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
};

export default async function Home() {
  const [session, prices] = await Promise.all([
    getServerSession(authOptions),
    prisma.facility.groupBy({ by: ["sport"], _min: { pricePerHour: true } }),
  ]);
  const priceBySport = new Map(prices.map((item) => [item.sport, item._min.pricePerHour]));

  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero">
          <div className="hero-content">
            <p className="overline">The modern sports club</p>
            <h1>Book your game.<br />Own your time.</h1>
            <p className="hero-description">Premium courts. Effortless reservations. More time for the sport you love.</p>
            <div className="hero-actions">
              <Link className="button" href={session ? "/book" : "/register"}>{session ? "Book Now" : "Become a member"}</Link>
              {!session && <Link className="underlined-link" href="/login">Sign in</Link>}
            </div>
          </div>
          <div className="hero-image">
            <Image src="https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1800&q=85" alt="Basketball court at a premium sports club" fill priority sizes="(max-width: 800px) 100vw, 48vw" />
            <div className="hero-image-caption"><span>CourtSide / 01</span><span>Play on your terms</span></div>
          </div>
        </section>

        <section className="sports-section">
          <div className="section-intro"><div><p className="overline">Our facilities</p><h2>Choose your game.</h2></div><p>Thoughtfully maintained spaces for every kind of play, available from 6:00 to 22:00.</p></div>
          <div className="sports-grid">
            {SPORTS.map((sport, index) => (
              <Link className="sport-card" href={`/book`} key={sport}>
                <div className="sport-image"><Image src={sportImages[sport]} alt={`${sport} at CourtSide`} fill sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw" /></div>
                <div className="sport-card-top"><span>0{index + 1}</span><Icon name={sport as IconName} width={28} height={28} /></div>
                <div className="sport-card-bottom"><h3>{sport}</h3><span>From ${priceBySport.get(sport) ?? "—"}/hr</span></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="club-statement"><p className="overline">Less planning. More playing.</p><h2>Your club, on your schedule.</h2><Link className="button button-outline light-button" href="/book">Explore availability</Link></section>
      </main>
      <footer className="site-footer"><Link className="wordmark" href="/">CourtSide<span>.</span></Link><p>Book your game. Own your time.</p><span>Open daily / 6:00–22:00</span></footer>
    </>
  );
}
