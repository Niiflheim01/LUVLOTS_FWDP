import { sellers } from '../data/sellers';
import SellerCard from './SellerCard';

export default function SellerList({ filter, filterText }: { filter: string; filterText: string }) {
  const filteredSellers = sellers.filter((seller) => {
    const matchesType = filter === 'all' || seller.isCelebrityOrInfluencer;
    const matchesSearch = seller.name.toLowerCase().includes(filterText.toLowerCase());
    return matchesType && matchesSearch;
  });

  return filteredSellers.map((seller) => (
    <SellerCard
      key={seller.id}
      name={seller.name}
      source={require('../../../assets/images/seller.jpg')}
      type={seller.type}
    />
  ));
}
