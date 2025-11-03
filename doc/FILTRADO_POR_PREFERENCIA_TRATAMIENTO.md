# 🎯 FILTRADO POR PREFERENCIA DE TRATAMIENTO
## BioPlantes - Personalización según elección del usuario

**Fecha:** 3 de Noviembre, 2025  
**Estado:** 🚧 PENDIENTE DE IMPLEMENTAR

---

## 🚨 PROBLEMA IDENTIFICADO

Actualmente el sistema **NO respeta** la preferencia de tratamiento del usuario:

```typescript
// ❌ COMPORTAMIENTO ACTUAL (INCORRECTO):
Usuario selecciona "Medicina Natural" 
  → Ve: Explorar Plantas ✓ + Medicamentos ❌ + Favoritos (ambos) ❌

Usuario selecciona "Medicina Convencional" 
  → Ve: Explorar Plantas ❌ + Medicamentos ✓ + Favoritos (ambos) ❌

Usuario selecciona "Medicina Integrativa" 
  → Ve: Explorar Plantas ✓ + Medicamentos ✓ + Favoritos (ambos) ✓
```

**Todos ven TODO sin importar su preferencia** ❌

---

## ✅ COMPORTAMIENTO CORRECTO (A IMPLEMENTAR)

### 1️⃣ Usuario con "Medicina Natural"

**Menú de navegación:**
```
🌿 Explorar Plantas  ✓
🏠 Inicio
🔔 Notificaciones
👤 Perfil
🚪 Salir
```

**Páginas disponibles:**
- ✅ `/explorar` - Catálogo de plantas
- ✅ `/plantas/:id` - Detalle de planta
- ✅ `/favoritos` - Solo muestra PLANTAS favoritas
- ✅ `/perfil` - Perfil del usuario
- ❌ `/medications` - **OCULTO** (redirige a /explorar)
- ❌ `/medications/:id` - **OCULTO** (redirige a /explorar)

**Dashboard:**
```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="plantas">🌿 Mis Plantas Favoritas</TabsTrigger>
    {/* NO hay tab de medicamentos */}
  </TabsList>
  
  <TabsContent value="plantas">
    {/* Mostrar solo plantas favoritas */}
  </TabsContent>
</Tabs>
```

---

### 2️⃣ Usuario con "Medicina Convencional"

**Menú de navegación:**
```
💊 Medicamentos  ✓
🏠 Inicio
🔔 Notificaciones
👤 Perfil
🚪 Salir
```

**Páginas disponibles:**
- ❌ `/explorar` - **OCULTO** (redirige a /medications)
- ❌ `/plantas/:id` - **OCULTO** (redirige a /medications)
- ✅ `/medications` - Catálogo de medicamentos
- ✅ `/medications/:id` - Detalle de medicamento
- ✅ `/mis-medicamentos` - Medicamentos que está tomando
- ✅ `/perfil` - Perfil del usuario

**Dashboard:**
```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="medicamentos">💊 Mis Medicamentos</TabsTrigger>
    {/* NO hay tab de plantas */}
  </TabsList>
  
  <TabsContent value="medicamentos">
    {/* Mostrar solo medicamentos registrados */}
  </TabsContent>
</Tabs>
```

---

### 3️⃣ Usuario con "Medicina Integrativa" (RECOMENDADO)

**Menú de navegación:**
```
🌿 Explorar Plantas  ✓
💊 Medicamentos  ✓
⚠️ Interacciones  ✓  (nuevo)
🏠 Inicio
🔔 Notificaciones
👤 Perfil
🚪 Salir
```

**Páginas disponibles:**
- ✅ `/explorar` - Catálogo de plantas
- ✅ `/plantas/:id` - Detalle de planta con InteractionChecker
- ✅ `/medications` - Catálogo de medicamentos
- ✅ `/medications/:id` - Detalle de medicamento con InteractionChecker
- ✅ `/favoritos` - Plantas Y medicamentos
- ✅ `/interacciones` - Vista dedicada de todas las interacciones detectadas
- ✅ `/perfil` - Perfil del usuario

**Dashboard:**
```tsx
<Tabs defaultValue="plantas">
  <TabsList>
    <TabsTrigger value="plantas">🌿 Mis Plantas</TabsTrigger>
    <TabsTrigger value="medicamentos">💊 Mis Medicamentos</TabsTrigger>
    <TabsTrigger value="interacciones">⚠️ Interacciones</TabsTrigger>
  </TabsList>
  
  <TabsContent value="plantas">
    {/* Plantas favoritas */}
  </TabsContent>
  
  <TabsContent value="medicamentos">
    {/* Medicamentos registrados */}
  </TabsContent>
  
  <TabsContent value="interacciones">
    {/* Todas las interacciones detectadas */}
    <InteractionChecker showAll={true} />
  </TabsContent>
</Tabs>
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Paso 1: Hook personalizado para obtener preferencia

**Crear:** `client/hooks/useTreatmentPreference.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/modules/auth/useAuth';

type TreatmentPreference = 'natural' | 'conventional' | 'integrative';

export function useTreatmentPreference() {
  const { session } = useAuth();
  const [preference, setPreference] = useState<TreatmentPreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setPreference(null);
      setLoading(false);
      return;
    }

    fetchPreference();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('profile-preference-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          if (payload.new.treatment_preference) {
            setPreference(payload.new.treatment_preference as TreatmentPreference);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const fetchPreference = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('treatment_preference')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      setPreference((data?.treatment_preference as TreatmentPreference) || 'integrative');
    } catch (error) {
      console.error('Error fetching treatment preference:', error);
      setPreference('integrative'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  return { preference, loading };
}
```

---

### Paso 2: Modificar Navbar con filtrado dinámico

**Modificar:** `client/components/Navbar.tsx`

```typescript
import { useTreatmentPreference } from '@/hooks/useTreatmentPreference';

export default function Navbar() {
  const { session, logout } = useAuth();
  const { preference, loading } = useTreatmentPreference();
  // ... resto del código

  // Determinar qué links mostrar según preferencia
  const showPlants = preference === 'natural' || preference === 'integrative';
  const showMedications = preference === 'conventional' || preference === 'integrative';
  const showInteractions = preference === 'integrative';

  return (
    <header className="...">
      <nav className="hidden md:flex items-center gap-1">
        {session && session.role !== "admin" && (
          <>
            {/* PLANTAS - Solo si preferencia permite */}
            {showPlants && (
              <NavLink to="/explorar" className={navItemClass}>
                🌿 Explorar Plantas
              </NavLink>
            )}

            {/* MEDICAMENTOS - Solo si preferencia permite */}
            {showMedications && (
              <NavLink to="/medications" className={navItemClass}>
                💊 Medicamentos
              </NavLink>
            )}

            {/* INTERACCIONES - Solo para usuarios integrativos */}
            {showInteractions && (
              <NavLink to="/interacciones" className={navItemClass}>
                <div className="flex items-center gap-1.5">
                  ⚠️ Interacciones
                  {/* Badge si hay interacciones activas */}
                </div>
              </NavLink>
            )}

            {/* FAVORITOS - Siempre visible */}
            <NavLink to="/favoritos" className={navItemClass}>
              <div className="flex items-center gap-1.5">
                Favoritos
                {favoritesCount > 0 && (
                  <Badge variant="secondary" className="...">
                    {favoritesCount}
                  </Badge>
                )}
              </div>
            </NavLink>

            {/* Resto de navegación común */}
            <button onClick={() => setSuggestModalOpen(true)} className={navItemClass({ isActive: false })}>
              Sugerir
            </button>
            <NotificationCenter />
            <NavLink to="/perfil" className={navItemClass}>Perfil</NavLink>
            <button onClick={handleLogout} className={navItemClass({ isActive: false })}>Salir</button>
          </>
        )}
      </nav>

      {/* Mobile navigation - aplicar mismo filtrado */}
      <SheetContent side="right">
        <nav className="flex flex-col gap-2 mt-6">
          {showPlants && (
            <NavLink to="/explorar" onClick={() => setMobileMenuOpen(false)}>
              🌿 Explorar Plantas
            </NavLink>
          )}
          
          {showMedications && (
            <NavLink to="/medications" onClick={() => setMobileMenuOpen(false)}>
              💊 Medicamentos
            </NavLink>
          )}
          
          {showInteractions && (
            <NavLink to="/interacciones" onClick={() => setMobileMenuOpen(false)}>
              ⚠️ Interacciones
            </NavLink>
          )}
          
          {/* Resto de navegación... */}
        </nav>
      </SheetContent>
    </header>
  );
}
```

---

### Paso 3: Rutas protegidas según preferencia

**Modificar:** `client/App.tsx`

```typescript
import { useTreatmentPreference } from '@/hooks/useTreatmentPreference';
import { Navigate } from 'react-router-dom';

// Componente protector de rutas
function PreferenceProtectedRoute({ 
  children, 
  requiresPlants = false, 
  requiresMedications = false 
}: { 
  children: React.ReactNode; 
  requiresPlants?: boolean; 
  requiresMedications?: boolean;
}) {
  const { preference, loading } = useTreatmentPreference();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>;
  }

  // Si requiere plantas pero usuario NO tiene acceso a plantas
  if (requiresPlants && preference === 'conventional') {
    return <Navigate to="/medications" replace />;
  }

  // Si requiere medicamentos pero usuario NO tiene acceso a medicamentos
  if (requiresMedications && preference === 'natural') {
    return <Navigate to="/explorar" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas POR AUTENTICACIÓN */}
      <Route path="/perfil" element={<RequireAuth><ProfilePage /></RequireAuth>} />

      {/* Rutas protegidas POR PREFERENCIA - PLANTAS */}
      <Route 
        path="/explorar" 
        element={
          <RequireAuth>
            <PreferenceProtectedRoute requiresPlants={true}>
              <ExplorePage />
            </PreferenceProtectedRoute>
          </RequireAuth>
        } 
      />
      
      <Route 
        path="/plantas/:id" 
        element={
          <RequireAuth>
            <PreferenceProtectedRoute requiresPlants={true}>
              <PlantDetailPage />
            </PreferenceProtectedRoute>
          </RequireAuth>
        } 
      />

      {/* Rutas protegidas POR PREFERENCIA - MEDICAMENTOS */}
      <Route 
        path="/medications" 
        element={
          <RequireAuth>
            <PreferenceProtectedRoute requiresMedications={true}>
              <MedicationsPage />
            </PreferenceProtectedRoute>
          </RequireAuth>
        } 
      />
      
      <Route 
        path="/medications/:id" 
        element={
          <RequireAuth>
            <PreferenceProtectedRoute requiresMedications={true}>
              <MedicationDetailPage />
            </PreferenceProtectedRoute>
          </RequireAuth>
        } 
      />

      {/* Rutas solo para INTEGRATIVE */}
      <Route 
        path="/interacciones" 
        element={
          <RequireAuth>
            <PreferenceProtectedRoute requiresPlants={true} requiresMedications={true}>
              <InteractionsOverviewPage />
            </PreferenceProtectedRoute>
          </RequireAuth>
        } 
      />

      {/* FAVORITOS - Filtrado dinámico interno según preferencia */}
      <Route path="/favoritos" element={<RequireAuth><FavoritesPage /></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin/*" element={<RequireAuth><AdminRoutes /></RequireAuth>} />
    </Routes>
  );
}
```

---

### Paso 4: Filtrar contenido en FavoritesPage

**Modificar:** `client/pages/FavoritesPage.tsx`

```typescript
import { useTreatmentPreference } from '@/hooks/useTreatmentPreference';

export default function FavoritesPage() {
  const { preference } = useTreatmentPreference();
  const [favorites, setFavorites] = useState<Plant[]>([]);
  const [userMedications, setUserMedications] = useState<Medication[]>([]);

  const showPlants = preference === 'natural' || preference === 'integrative';
  const showMedications = preference === 'conventional' || preference === 'integrative';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Favoritos</h1>

      {/* SOLO PLANTAS */}
      {preference === 'natural' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">🌿 Mis Plantas Favoritas</h2>
          {/* Grid de plantas */}
        </div>
      )}

      {/* SOLO MEDICAMENTOS */}
      {preference === 'conventional' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">💊 Mis Medicamentos</h2>
          {/* Grid de medicamentos */}
        </div>
      )}

      {/* AMBOS (INTEGRATIVE) */}
      {preference === 'integrative' && (
        <Tabs defaultValue="plantas">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plantas">🌿 Plantas</TabsTrigger>
            <TabsTrigger value="medicamentos">💊 Medicamentos</TabsTrigger>
            <TabsTrigger value="interacciones">⚠️ Interacciones</TabsTrigger>
          </TabsList>

          <TabsContent value="plantas">
            {/* Grid de plantas favoritas */}
          </TabsContent>

          <TabsContent value="medicamentos">
            {/* Grid de medicamentos registrados */}
          </TabsContent>

          <TabsContent value="interacciones">
            <InteractionChecker showAll={true} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
```

---

### Paso 5: Dashboard dinámico

**Modificar:** `client/pages/Dashboard.tsx` (si existe)

```typescript
import { useTreatmentPreference } from '@/hooks/useTreatmentPreference';

export default function Dashboard() {
  const { preference } = useTreatmentPreference();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Mi Panel de Control
      </h1>

      {/* Mostrar tabs según preferencia */}
      {preference === 'integrative' ? (
        <Tabs defaultValue="plantas">
          <TabsList>
            <TabsTrigger value="plantas">🌿 Mis Plantas</TabsTrigger>
            <TabsTrigger value="medicamentos">💊 Mis Medicamentos</TabsTrigger>
            <TabsTrigger value="interacciones">⚠️ Interacciones</TabsTrigger>
          </TabsList>

          <TabsContent value="plantas">
            {/* Estadísticas de plantas */}
          </TabsContent>

          <TabsContent value="medicamentos">
            {/* Estadísticas de medicamentos */}
          </TabsContent>

          <TabsContent value="interacciones">
            <InteractionChecker showAll={true} />
          </TabsContent>
        </Tabs>
      ) : preference === 'natural' ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">🌿 Mis Plantas</h2>
          {/* Solo mostrar sección de plantas */}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">💊 Mis Medicamentos</h2>
          {/* Solo mostrar sección de medicamentos */}
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 EXPERIENCIA DE USUARIO

### Flujo: Usuario selecciona "Medicina Natural"

1. **En OnboardingWizard Step 0:**
   - Usuario hace clic en tarjeta "🌿 Medicina Natural"
   - Se guarda `treatment_preference = 'natural'` en BD

2. **Después de completar onboarding:**
   - Redirige a `/explorar` (catálogo de plantas)
   - Navbar solo muestra: Explorar Plantas | Favoritos | Perfil | Salir
   - Dashboard solo muestra sección "Mis Plantas Favoritas"

3. **Si intenta acceder a `/medications`:**
   - Redirección automática a `/explorar`
   - Mensaje toast: "Esta sección no está disponible con tu preferencia de Medicina Natural"

---

### Flujo: Usuario selecciona "Medicina Convencional"

1. **En OnboardingWizard Step 0:**
   - Usuario hace clic en tarjeta "💊 Medicina Convencional"
   - Se guarda `treatment_preference = 'conventional'` en BD

2. **Después de completar onboarding:**
   - Redirige a `/medications` (catálogo de medicamentos)
   - Navbar solo muestra: Medicamentos | Mis Medicamentos | Perfil | Salir
   - Dashboard solo muestra sección "Mis Medicamentos"

3. **Si intenta acceder a `/explorar`:**
   - Redirección automática a `/medications`
   - Mensaje toast: "Esta sección no está disponible con tu preferencia de Medicina Convencional"

---

### Flujo: Usuario selecciona "Medicina Integrativa" ⭐

1. **En OnboardingWizard Step 0:**
   - Usuario hace clic en tarjeta "🌿💊 Medicina Integrativa (RECOMENDADO)"
   - Se guarda `treatment_preference = 'integrative'` en BD

2. **Después de completar onboarding:**
   - Redirige a `/explorar` por defecto
   - Navbar muestra: Explorar Plantas | Medicamentos | Interacciones | Favoritos | Perfil | Salir
   - Dashboard muestra TABS: Mis Plantas | Mis Medicamentos | Interacciones

3. **Funciones exclusivas:**
   - InteractionChecker activo en todas las páginas
   - Alertas automáticas al agregar planta o medicamento
   - Vista `/interacciones` con resumen completo

---

## 🔄 CAMBIO DE PREFERENCIA

**En página de Perfil:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Preferencia de Tratamiento</CardTitle>
    <CardDescription>
      Personaliza tu experiencia según tu enfoque de salud
    </CardDescription>
  </CardHeader>
  
  <CardContent>
    <RadioGroup 
      value={preference} 
      onValueChange={handlePreferenceChange}
    >
      <div className="flex flex-col gap-3">
        <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
          <RadioGroupItem value="natural" />
          <div>
            <p className="font-semibold">🌿 Medicina Natural</p>
            <p className="text-sm text-muted-foreground">
              Solo plantas medicinales y remedios naturales
            </p>
          </div>
        </Label>

        <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
          <RadioGroupItem value="conventional" />
          <div>
            <p className="font-semibold">💊 Medicina Convencional</p>
            <p className="text-sm text-muted-foreground">
              Solo medicamentos farmacológicos
            </p>
          </div>
        </Label>

        <Label className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg cursor-pointer hover:bg-muted">
          <RadioGroupItem value="integrative" />
          <div>
            <p className="font-semibold">🌿💊 Medicina Integrativa (Recomendado)</p>
            <p className="text-sm text-muted-foreground">
              Combina ambos enfoques con verificación de interacciones
            </p>
          </div>
        </Label>
      </div>
    </RadioGroup>

    {/* Advertencia si cambia de integrative a otro */}
    {preference === 'integrative' && (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Advertencia</AlertTitle>
        <AlertDescription>
          Al cambiar a "Solo Natural" o "Solo Convencional", perderás acceso 
          al sistema de detección de interacciones.
        </AlertDescription>
      </Alert>
    )}
  </CardContent>
</Card>
```

---

## 📊 RESUMEN DE CAMBIOS NECESARIOS

### Archivos a crear:
1. ✅ `client/hooks/useTreatmentPreference.ts` - Hook para obtener preferencia
2. ✅ `client/pages/InteractionsOverviewPage.tsx` - Vista dedicada de interacciones
3. ✅ `client/components/PreferenceProtectedRoute.tsx` - Componente protector

### Archivos a modificar:
1. ✅ `client/components/Navbar.tsx` - Filtrar links según preferencia
2. ✅ `client/App.tsx` - Rutas protegidas por preferencia
3. ✅ `client/pages/FavoritesPage.tsx` - Filtrar contenido
4. ✅ `client/pages/Dashboard.tsx` - Tabs dinámicos
5. ✅ `client/pages/ProfilePage.tsx` - Selector de preferencia

---

## 🎯 PRÓXIMOS PASOS

1. **Crear hook `useTreatmentPreference`**
2. **Modificar Navbar con filtrado dinámico**
3. **Implementar rutas protegidas en App.tsx**
4. **Actualizar FavoritesPage con tabs condicionales**
5. **Crear InteractionsOverviewPage para usuarios integrativos**
6. **Agregar selector de preferencia en ProfilePage**
7. **Testear flujos completos de cada preferencia**

---

**¡Gracias por identificar este error crítico en la arquitectura!** 🎉

Esto hace que el sistema sea verdaderamente personalizado según el enfoque de salud del usuario.
