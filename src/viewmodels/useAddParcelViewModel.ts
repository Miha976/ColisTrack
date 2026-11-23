import { useEffect, useRef, useState } from 'react';
import { useServices } from '@/di/ServicesContext';
import { extractAddressQuery } from '@/core/addressExtractor';
import { makeThumbnail } from '@/core/image';
import type { Address } from '@/models/Address';
import type { ParcelSize } from '@/models/Parcel';

/** Machine à états simple : un seul écran, étapes successives et guidées. */
export type AddStep = 'start' | 'reading' | 'address' | 'details';

export function useAddParcelViewModel() {
  const { camera, ocr, geocoding, parcelStore } = useServices();
  const [step, setStep] = useState<AddStep>('start');
  const [photo, setPhoto] = useState<string>();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [searching, setSearching] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [size, setSize] = useState<ParcelSize>('medium');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Recherche d'adresse avec anti-rebond (debounce 350 ms)
  useEffect(() => {
    if (step !== 'address') return;
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      if (query.trim().length < 3) return setSuggestions([]);
      setSearching(true);
      try {
        const res = await geocoding.search(query);
        if (id === requestId.current) {
          setSuggestions(res);
          setError(res.length ? null : 'Aucune adresse trouvée. Corrigez le texte ci-dessus.');
        }
      } catch {
        if (id === requestId.current) setError('Pas de connexion internet pour chercher l’adresse.');
      } finally {
        if (id === requestId.current) setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, step, geocoding]);

  async function scan() {
    setError(null);
    const dataUrl = await camera.takePhoto();
    if (!dataUrl) return;
    setStep('reading');
    try {
      const [thumb, text] = await Promise.all([makeThumbnail(dataUrl), ocr.recognize(dataUrl)]);
      const found = extractAddressQuery(text);
      setPhoto(thumb);
      setQuery(found ?? '');
      setError(found ? null : 'Adresse non lue. Tapez-la ci-dessous.');
    } catch {
      setError('Lecture impossible. Tapez l’adresse ci-dessous.');
    }
    setStep('address');
  }

  const typeManually = () => {
    setError(null);
    setStep('address');
  };

  const chooseAddress = (a: Address) => {
    setAddress(a);
    setStep('details');
  };

  const save = (): string | null => {
    if (!address) return null;
    return parcelStore.add({
      address,
      size,
      photo,
      recipient: recipient.trim() || undefined,
      note: note.trim() || undefined,
    }).id;
  };

  const back = () => setStep(step === 'details' ? 'address' : 'start');

  return {
    step, photo, query, setQuery, suggestions, searching, address, size, setSize,
    recipient, setRecipient, note, setNote, error,
    scan, typeManually, chooseAddress, save, back,
  };
}
