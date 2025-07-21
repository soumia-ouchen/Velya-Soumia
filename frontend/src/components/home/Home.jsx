import EcommerceMetrics from "./EcommerceMetrics";
import GeographicStats from "./GeographicStats";
import OfferStats from "./OfferStats";

export default function Home() {

  return (
    
      
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

        </div>


      <div className="col-span-12">
        <GeographicStats />
      </div>
      <div className="col-span-12">
        <OfferStats />
      </div>

      </div>
    
  );
}