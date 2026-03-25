import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Minus, Plus, ShoppingBag, Tag } from 'lucide-react-native';
import { router } from 'expo-router';

const productsData = [
  {
    id: '1',
    name: 'Iconic Fashion Set',
    seller: 'Mimiyuuuh',
    price: 6500,
    size: 'M',
    color: 'Multi',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
    quantity: 1,
  },
  {
    id: '2',
    name: 'Signed MAC Collab Palette',
    seller: 'Bretman Rock',
    price: 7800,
    size: 'One Size',
    color: 'Multi',
    imageUri: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80',
    quantity: 1,
  },
  {
    id: '3',
    name: 'Luxury Handbag',
    seller: 'Kathryn Bernardo',
    price: 14000,
    size: 'One Size',
    color: 'Tan',
    imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80',
    quantity: 1,
  },
];

export default function CartScreen() {
  const [products, setProducts] = useState(productsData);
  const [selectedIds, setSelectedIds] = useState<string[]>(products.map((p) => p.id));

  const increase = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
    );
  };

  const decrease = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );
  };

  const removeItem = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
  const subtotal = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View
          style={{
            backgroundColor: '#4289AB',
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontSize: 18,
              color: '#fff',
            }}>
            My Cart ({products.length})
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, paddingBottom: 180, gap: 10 }}
        showsVerticalScrollIndicator={false}>
        {/* Voucher Banner */}
        <Pressable
          onPress={() => router.push('/(main)/VouchersScreen' as any)}
          style={{
            backgroundColor: '#FFF8E7',
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: '#F5E6B8',
          }}>
          <Tag size={14} color="#D9AC4E" />
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#B8860B', flex: 1 }}>
            Apply voucher to save more!
          </Text>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#D9AC4E' }}>
            Select →
          </Text>
        </Pressable>

        {products.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ShoppingBag size={64} color="#CCC" />
            <Text
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 16,
                color: '#999',
                marginTop: 16,
              }}>
              Your cart is empty
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/(store)')}
              style={{
                marginTop: 16,
                backgroundColor: '#4289AB',
                paddingHorizontal: 28,
                paddingVertical: 10,
                borderRadius: 20,
              }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#fff' }}>
                Shop Now
              </Text>
            </Pressable>
          </View>
        ) : (
          products.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}>
              {/* Seller Row */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingTop: 10,
                  paddingBottom: 6,
                  gap: 6,
                }}>
                <ShoppingBag size={12} color="#4289AB" />
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#333' }}>
                  {item.seller}
                </Text>
              </View>

              {/* Product Row */}
              <View style={{ flexDirection: 'row', padding: 12, paddingTop: 0 }}>
                {/* Checkbox */}
                <Pressable
                  onPress={() => toggleSelect(item.id)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: selectedIds.includes(item.id) ? '#4289AB' : '#DDD',
                    backgroundColor: selectedIds.includes(item.id) ? '#4289AB' : '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                    marginTop: 10,
                  }}>
                  {selectedIds.includes(item.id) && (
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                  )}
                </Pressable>

                <Image
                  source={{ uri: item.imageUri }}
                  style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#F5F5F5' }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins_600SemiBold',
                      fontSize: 13,
                      color: '#222',
                    }}
                    numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins_400Regular',
                      fontSize: 11,
                      color: '#999',
                      marginTop: 2,
                    }}>
                    {item.color} · {item.size}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins_700Bold',
                      fontSize: 15,
                      color: '#EE4D2D',
                      marginTop: 4,
                    }}>
                    ₱{item.price.toFixed(2)}
                  </Text>

                  {/* Quantity Controls */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 6,
                      gap: 2,
                    }}>
                    <Pressable
                      onPress={() => decrease(item.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Minus size={14} color="#666" />
                    </Pressable>
                    <View
                      style={{
                        width: 36,
                        height: 28,
                        borderTopWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: '#E0E0E0',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' }}>
                        {item.quantity}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => increase(item.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Plus size={14} color="#666" />
                    </Pressable>

                    <Pressable
                      onPress={() => removeItem(item.id)}
                      style={{ marginLeft: 'auto' }}>
                      <Trash2 size={16} color="#CCC" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Checkout Bar */}
      {products.length > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: 34,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#999' }}>
              Total ({selectedProducts.length} items)
            </Text>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#EE4D2D' }}>
              ₱{subtotal.toFixed(2)}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/checkout')}
            style={{
              backgroundColor: '#EE4D2D',
              paddingHorizontal: 36,
              paddingVertical: 12,
              borderRadius: 8,
            }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff' }}>
              Check Out
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
