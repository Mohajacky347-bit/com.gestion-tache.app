'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from "framer-motion"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Train, 
  Moon, 
  Sun,
  Lock,
  User,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck
} from 'lucide-react'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'chef_section' | 'chef_brigade' | ''>('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('fce-ui-theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(stored === 'dark' || (stored === 'system' && systemDark) || (!stored && systemDark))
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    localStorage.setItem('fce-ui-theme', newTheme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
    setIsDark(!isDark)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!identifier || !password || !role) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setIsLoading(true)
    
    try {
      const success = await login(identifier, password, role as 'chef_section' | 'chef_brigade')
      
      if (success) {
        if (role === 'chef_section') {
          router.push('/')
        } else {
          router.push('/brigade')
        }
      } else {
        setError('Identifiant ou mot de passe incorrect')
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Zap, label: "Rapide", description: "Interface optimisée" },
    { icon: ShieldCheck, label: "Sécurisé", description: "Données protégées" },
    { icon: Clock, label: "24/7", description: "Disponible en continu" },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background font-sans antialiased">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary/40 to-primary/10 rounded-full mix-blend-multiply filter blur-[100px]"
          animate={{ 
            x: [0, 80, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-accent/30 to-accent/10 rounded-full mix-blend-multiply filter blur-[100px]"
          animate={{ 
            x: [0, -60, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-[80px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/50 rounded-full"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, i % 2 === 0 ? 15 : -15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Glowing lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <motion.line
            x1="0%" y1="30%" x2="100%" y2="70%"
            stroke="url(#gradient1)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0 }}
          />
          <motion.line
            x1="100%" y1="20%" x2="0%" y2="80%"
            stroke="url(#gradient2)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Theme Toggle */}
      <motion.div 
        className="absolute top-6 right-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-card/80 backdrop-blur-md border-border/50 hover:bg-card shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
          </motion.div>
        </Button>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left side - Branding */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              {/* Logo */}
              <motion.div 
                className="inline-flex items-center gap-4 mb-10"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="relative w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
                  animate={{ 
                    boxShadow: [
                      "0 0 30px hsl(var(--primary) / 0.3)",
                      "0 0 60px hsl(var(--primary) / 0.5)",
                      "0 0 30px hsl(var(--primary) / 0.3)",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Train className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">FCE</h1>
                  <p className="text-sm text-muted-foreground font-medium">Infrastructure</p>
                </div>
              </motion.div>
              
              <motion.h2 
                className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Système de Gestion
                <motion.span 
                  className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: "200%" }}
                >
                  Infrastructure
                </motion.span>
              </motion.h2>
              
              <motion.p 
                className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Plateforme de gestion des travaux, équipes et ressources pour le chemin de fer FCE.
              </motion.p>

              {/* Features */}
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground text-sm">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                {[
                  { value: "87+", label: "Années d'expertise" },
                  { value: "150+", label: "Employés actifs" },
                  { value: "1936", label: "Année de fondation" },
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center lg:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <motion.p 
                      className="text-3xl lg:text-4xl font-bold text-primary"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <Card className="relative overflow-hidden border border-border/50 shadow-2xl bg-card/95 backdrop-blur-xl">
                {/* Card glow effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <motion.div 
                  className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/20 rounded-full blur-[100px]"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                />
                
                <div className="relative p-8 lg:p-10 space-y-8">
                  {/* Header */}
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="w-10 h-1.5 gradient-primary rounded-full" />
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Authentification</span>
                    </motion.div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                      Connexion
                    </h2>
                    <p className="text-muted-foreground">Accédez à votre espace de travail sécurisé</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                      >
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-destructive">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                    
                    {/* Role Field */}
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-foreground font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Rôle
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={role === 'chef_section' ? "default" : "outline"}
                          onClick={() => setRole('chef_section')}
                          disabled={isLoading}
                          className={`h-12 transition-all ${role === 'chef_section' ? 'gradient-primary text-primary-foreground shadow-glow' : 'bg-background hover:bg-accent/10'}`}
                        >
                          <Users className={`mr-2 h-4 w-4 ${role === 'chef_section' ? 'text-primary-foreground' : 'text-primary'}`} />
                          Chef de Section
                        </Button>
                        <Button
                          type="button"
                          variant={role === 'chef_brigade' ? "default" : "outline"}
                          onClick={() => setRole('chef_brigade')}
                          disabled={isLoading}
                          className={`h-12 transition-all ${role === 'chef_brigade' ? 'gradient-primary text-primary-foreground shadow-glow' : 'bg-background hover:bg-accent/10'}`}
                        >
                          <Shield className={`mr-2 h-4 w-4 ${role === 'chef_brigade' ? 'text-primary-foreground' : 'text-primary'}`} />
                          Chef de Brigade
                        </Button>
                      </div>
                    </div>
                    
                    {/* Identifier Field */}
                    <div className="space-y-2">
                      <Label htmlFor="identifier" className="text-foreground font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Identifiant
                      </Label>
                      <div className="relative">
                        <Input
                          id="identifier"
                          type="text"
                          placeholder={role === 'chef_section' ? 'votre.email@fce.mg' : 'E010'}
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          onFocus={() => setFocusedField('identifier')}
                          onBlur={() => setFocusedField(null)}
                          required
                          disabled={isLoading}
                          className={`h-10 pl-3 pr-10 text-sm border transition-all duration-300 bg-background
                            ${focusedField === 'identifier' 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-border hover:border-muted-foreground/30'
                            }`}
                        />
                        <motion.div 
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          animate={{ opacity: focusedField === 'identifier' ? 1 : 0.5 }}
                        >
                          <CheckCircle2 className={`h-5 w-5 transition-colors ${identifier ? 'text-success' : 'text-muted-foreground/30'}`} />
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-semibold flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          required
                          disabled={isLoading}
                          className={`h-10 pl-3 pr-10 text-sm border transition-all duration-300 bg-background
                            ${focusedField === 'password' 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-border hover:border-muted-foreground/30'
                            }`}
                        />
                        <motion.div 
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          animate={{ opacity: focusedField === 'password' ? 1 : 0.5 }}
                        >
                          <CheckCircle2 className={`h-5 w-5 transition-colors ${password ? 'text-success' : 'text-muted-foreground/30'}`} />
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button 
                        type="submit" 
                        className="group relative w-full h-10 gradient-primary hover:opacity-90 text-primary-foreground font-semibold text-sm shadow-glow transition-all overflow-hidden" 
                        disabled={isLoading}
                      >
                        {/* Shine effect */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          initial={{ x: "-200%" }}
                          animate={{ x: "200%" }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                        
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Connexion en cours...
                          </>
                        ) : (
                          <>
                            Se connecter
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                  
                  {/* Footer */}
                  <div className="pt-6 border-t border-border/50">
                    <p className="text-center text-sm text-muted-foreground">
                      Besoin d'aide ? Contactez le{' '}
                      <motion.span 
                        className="text-primary hover:text-primary/80 cursor-pointer font-semibold transition-colors inline-flex items-center gap-1"
                        whileHover={{ scale: 1.02 }}
                      >
                        support technique
                        <ArrowRight className="h-3 w-3" />
                      </motion.span>
                    </p>
                  </div>
                </div>
              </Card>
              
              <motion.p 
                className="text-center text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
                © 2026 FCE · Excellence depuis 1936
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}