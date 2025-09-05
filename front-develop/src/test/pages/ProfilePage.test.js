import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}))
vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: vi.fn()
}))
vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn()
  }
}))

const mockUser = {
  id: 'u1',
  name: 'Jean Test',
  email: 'jean@test.fr',
  roles: ['coach', 'user'],
  age: 30,
  contact: '0612345678',
  sex: 'Homme',
  pricing: 50,
  description: 'Coach sportif',
  legacy: '10 ans',
  created_at: '2023-01-01T12:00:00Z',
  photo: ''
}

const mockAuthStore = {
  user: { ...mockUser }
}
const mockSnackbar = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
}

import ProfilePage from '@/pages/ProfilePage.vue'
import { useAuthStore } from '@/stores/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/plugins/axios'

describe('ProfilePage.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.mockReturnValue(mockAuthStore)
    useSnackbarStore.mockReturnValue(mockSnackbar)
    api.get.mockResolvedValue({ data: { ...mockUser } })
    wrapper = mount(ProfilePage, {
    })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  it('affiche le nom et email de l\'utilisateur', async () => {
    await nextTick()
    expect(wrapper.text()).toContain(mockUser.name)
    expect(wrapper.text()).toContain(mockUser.email)
  })

  it('affiche les rôles et les icônes', async () => {
    await nextTick()
    for (const role of mockUser.roles) {
      expect(wrapper.text()).toContain(role)
    }
    expect(wrapper.html()).toContain('mdi-account-tie')
    expect(wrapper.html()).toContain('mdi-account')
  })

  it('affiche tous les champs personnels', async () => {
    await nextTick()
    expect(wrapper.html()).toContain('Email')
    expect(wrapper.html()).toContain('Nom')
    expect(wrapper.html()).toContain('Sexe')
    expect(wrapper.html()).toContain('Âge')
    expect(wrapper.html()).toContain('Contact')
    expect(wrapper.html()).toContain(mockUser.age.toString())
    expect(wrapper.html()).toContain(mockUser.contact)
    expect(wrapper.html()).toContain(mockUser.sex)
  })

  it('affiche la section coach si rôle coach', async () => {
    await nextTick()
    expect(wrapper.text()).toContain('Informations professionnelles')
    expect(wrapper.html()).toContain('Tarif')
    expect(wrapper.html()).toContain('Description')
    expect(wrapper.html()).toContain('Expérience')
  })

  it('n\'affiche pas la section coach si pas coach', async () => {
    mockAuthStore.user.roles = ['user']
    wrapper = mount(ProfilePage)
    await nextTick()
    expect(wrapper.text()).not.toContain('Informations professionnelles')
  })

  it('affiche la section sécurité et le champ mot de passe', async () => {
    await nextTick()
    expect(wrapper.text()).toContain('Sécurité')
    expect(wrapper.html()).toContain('Nouveau mot de passe')
  })

  it('affiche les infos de compte', async () => {
    await nextTick()
    expect(wrapper.text()).toContain('ID du compte')
    expect(wrapper.text()).toContain('Membre depuis')
    expect(wrapper.html()).toContain('2023')
  })

  it('ouvre la dialog photo au clic sur le bouton', async () => {
    if (!window.visualViewport) {
      window.visualViewport = {
        width: 1024,
        height: 768,
        scale: 1,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }
    }
    await nextTick()
    await wrapper.find('[data-test="secondary-btn"]').trigger('click')
    await nextTick()
    expect(wrapper.vm.photoDialog).toBe(true)
  })

  it('previewPhoto met à jour photoPreview', async () => {
    const file = new Blob(['dummy'], { type: 'image/png' })
    Object.defineProperty(file, 'name', { value: 'test.png' })
    const event = { target: { result: 'data:image/png;base64,test' } }
    const readerMock = { readAsDataURL: vi.fn(), onload: null }
    window.FileReader = vi.fn(() => readerMock)
    wrapper.vm.previewPhoto([file])
    readerMock.onload(event)
    expect(wrapper.vm.photoPreview).toBe('data:image/png;base64,test')
  })

  it('uploadPhoto effectue un upload et met à jour la photo', async () => {
    api.post.mockResolvedValue({ data: { photo_url: 'url/photo.jpg' } })
    wrapper.vm.selectedPhoto = [new Blob(['dummy'], { type: 'image/png' })]
    wrapper.vm.userProfile = { ...mockUser }
    await wrapper.vm.uploadPhoto()
    expect(api.post).toHaveBeenCalled()
    expect(wrapper.vm.userProfile.photo).toBe('url/photo.jpg')
    expect(mockSnackbar.success).toHaveBeenCalledWith('Photo de profil mise à jour avec succès')
    expect(wrapper.vm.photoDialog).toBe(false)
  })

  it('uploadPhoto gère les erreurs', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Erreur API' } } })
    wrapper.vm.selectedPhoto = [new Blob(['dummy'], { type: 'image/png' })]
    wrapper.vm.userProfile = { ...mockUser }
    await wrapper.vm.uploadPhoto()
    expect(mockSnackbar.error).toHaveBeenCalledWith('Erreur API')
    expect(wrapper.vm.fieldLoading.photo).toBe(false)
  })

  it('modifie un champ et sauvegarde au blur', async () => {
    api.patch.mockResolvedValue({ data: { email: 'new@email.fr' } })
    wrapper.vm.userProfile = { ...mockUser, email: 'new@email.fr' }
    wrapper.vm.originalProfile = { ...mockUser, email: 'jean@test.fr' }
    await wrapper.vm.onFieldBlur('email')
    expect(api.patch).toHaveBeenCalledWith(`/profiles/${mockUser.id}/email`, { email: 'new@email.fr' })
    expect(mockSnackbar.success).toHaveBeenCalledWith('Email mis à jour avec succès')
    expect(wrapper.vm.userProfile.email).toBe('new@email.fr')
  })

  it('modifie le mot de passe', async () => {
    api.patch.mockResolvedValue({ data: {} })
    wrapper.vm.newPassword = 'azerty123'
    wrapper.vm.userProfile = { ...mockUser }
    await wrapper.vm.onPasswordBlur()
    expect(api.patch).toHaveBeenCalledWith(`/profiles/${mockUser.id}/password`, { password: 'azerty123' })
    expect(mockSnackbar.success).toHaveBeenCalledWith('Mot de passe mis à jour avec succès')
    expect(wrapper.vm.newPassword).toBe('')
  })

  it('modifie le champ via select', async () => {
    api.patch.mockResolvedValue({ data: { sex: 'Femme' } })
    wrapper.vm.userProfile = { ...mockUser, sex: 'Femme' }
    wrapper.vm.originalProfile = { ...mockUser, sex: 'Homme' }
    await wrapper.vm.onSelectChange('sex')
    expect(api.patch).toHaveBeenCalledWith(`/profiles/${mockUser.id}`, { sex: 'Femme' })
    expect(mockSnackbar.success).toHaveBeenCalledWith('Sexe mis à jour avec succès')
    expect(wrapper.vm.userProfile.sex).toBe('Femme')
  })

  it('gère les erreurs de sauvegarde champ', async () => {
    api.patch.mockRejectedValue({ response: { data: { message: 'Erreur API' } } })
    wrapper.vm.userProfile = { ...mockUser, name: 'NouveauNom' }
    wrapper.vm.originalProfile = { ...mockUser, name: 'Jean Test' }
    await wrapper.vm.onFieldBlur('name')
    expect(mockSnackbar.error).toHaveBeenCalledWith('Erreur API')
    expect(wrapper.vm.userProfile.name).toBe('Jean Test')
    expect(wrapper.vm.fieldLoading.name).toBe(false)
  })

  it('affiche le loader sur les champs en cours de sauvegarde', async () => {
    wrapper.vm.fieldLoading.email = true
    await nextTick()
    expect(wrapper.html()).toContain('field-saving')
  })

  it('formatDate retourne une date formatée', () => {
    const date = '2023-01-01T12:00:00Z'
    expect(wrapper.vm.formatDate(date)).toBe('1 janvier 2023')
  })

  it('getRoleColor retourne la couleur du rôle', () => {
    expect(wrapper.vm.getRoleColor('admin')).toBe('red')
    expect(wrapper.vm.getRoleColor('coach')).toBe('blue')
    expect(wrapper.vm.getRoleColor('user')).toBe('green')
    expect(wrapper.vm.getRoleColor('autre')).toBe('grey')
  })

  it('getRoleIcon retourne l\'icône du rôle', () => {
    expect(wrapper.vm.getRoleIcon('admin')).toBe('mdi-crown')
    expect(wrapper.vm.getRoleIcon('coach')).toBe('mdi-account-tie')
    expect(wrapper.vm.getRoleIcon('user')).toBe('mdi-account')
    expect(wrapper.vm.getRoleIcon('autre')).toBe('mdi-account')
  })

  it('getFieldDisplayName retourne le nom affiché', () => {
    expect(wrapper.vm.getFieldDisplayName('email')).toBe('Email')
    expect(wrapper.vm.getFieldDisplayName('name')).toBe('Nom')
    expect(wrapper.vm.getFieldDisplayName('password')).toBe('Mot de passe')
    expect(wrapper.vm.getFieldDisplayName('unknown')).toBe('unknown')
  })
})