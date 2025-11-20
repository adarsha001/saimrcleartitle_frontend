import { useEffect, useState } from "react";
import { getProperties } from "../api/axios"
import PropertyCard from "../components/PropertyCard";
import { ShieldCheck, Building2, Home, CheckCircle, Award, ArrowRight, FileCheck, Lock } from "lucide-react";

export default function VerifiedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await getProperties();
        const verified = res.data.properties.filter((p) => p.isVerified);
        setProperties(verified);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 tracking-wide uppercase text-sm font-semibold">
            Loading Verified Properties
          </p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Verification Badge */}
          <div className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-widest uppercase">
              Authenticated Properties
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 tracking-tight">
            Verified Properties
          </h1>
          
          {/* Decorative Line with Shield */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-24 h-px bg-black" />
            <ShieldCheck className="w-5 h-5 fill-black stroke-white" />
            <div className="w-24 h-px bg-black" />
          </div>

          {/* Subtitle */}
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Every property in our verified collection has been thoroughly authenticated with 
            confirmed documentation, ownership verification, and detailed inspections.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FileCheck className="w-5 h-5" />
              <span className="font-medium">Documentation Verified</span>
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Ownership Confirmed</span>
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Inspection Complete</span>
            </div>
          </div>

          {/* Property Count */}
          <div className="inline-flex items-center gap-3 border-2 border-black px-8 py-3">
            <Award className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">
              {properties.length} Verified {properties.length === 1 ? "Property" : "Properties"} Available
            </span>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>

        {/* Verification Process Section */}
        <div className="mt-20 bg-white border-2 border-black p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-black mb-3 tracking-tight">
              Our Verification Process
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every property undergoes rigorous authentication to ensure complete transparency and trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white mb-4">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2 uppercase tracking-wider">
                Step 1
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Complete documentation review and legal verification of ownership records
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2 uppercase tracking-wider">
                Step 2
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Professional property inspection and condition assessment by certified experts
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2 uppercase tracking-wider">
                Step 3
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Final verification badge awarded after passing all authentication requirements
              </p>
            </div>
          </div>
        </div>

        
        <div className="mt-20 text-center border-t-2 border-black pt-12 pb-9">
    
        </div>
      </div>
    </div>
  );
}