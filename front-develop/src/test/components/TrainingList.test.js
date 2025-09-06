import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import TrainingList from '@/components/TrainingList.vue'


describe('TrainingList.vue', () => {
  let wrapper

  const mockTrainings = [
    {
      id: 1,
      name: 'Training 1',
      description: 'Description du training 1',
      duration: 60
    },
    {
      id: 2,
      name: 'Training 2',
      description: 'Description du training 2',
      duration: 45
    },
    {
      id: 3,
      name: 'Training 3',
      description: 'Description du training 3',
      duration: 30
    }
  ]

  const createWrapper = (props = {}) => {
    return mount(TrainingList, {
      props: {
        trainings: [],
        ...props
      },
      global: {
        stubs: {
          VCard: true,
          VCardTitle: true,
          VCardText: true,
          VIcon: true,
          VSpacer: true,
          VChip: true,
          VSlideGroup: true,
          VSlideItem: true,
          TrainingCard: true
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    wrapper = null
  })

  describe('Rendu du composant', () => {
    it('monte le composant correctement', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm).toBeDefined()
    })

    it('utilise les props trainings', () => {
      expect(wrapper.props('trainings')).toEqual([])
      expect(wrapper.vm.trainings).toEqual([])
    })

    it('accepte une prop trainings avec des données', () => {
      const customWrapper = createWrapper({ trainings: mockTrainings })
      
      expect(customWrapper.props('trainings')).toEqual(mockTrainings)
      expect(customWrapper.vm.trainings).toEqual(mockTrainings)
      
      customWrapper.unmount()
    })

    it('réagit aux changements de props', async () => {
      await wrapper.setProps({ trainings: mockTrainings })
      
      expect(wrapper.vm.trainings).toEqual(mockTrainings)
    })
  })

  describe('Logique du composant', () => {
    it('a une méthode onTrainingClick définie', () => {
      expect(typeof wrapper.vm.onTrainingClick).toBe('function')
    })

    it('émet trainingClick avec le bon ID', () => {
      const trainingId = 123
      
      wrapper.vm.onTrainingClick(trainingId)
      
      expect(wrapper.emitted('trainingClick')).toBeTruthy()
      expect(wrapper.emitted('trainingClick')).toHaveLength(1)
      expect(wrapper.emitted('trainingClick')[0]).toEqual([trainingId])
    })

    it('gère plusieurs appels à onTrainingClick', () => {
      wrapper.vm.onTrainingClick(1)
      wrapper.vm.onTrainingClick(2)
      wrapper.vm.onTrainingClick(3)
      
      const emittedEvents = wrapper.emitted('trainingClick')
      expect(emittedEvents).toHaveLength(3)
      expect(emittedEvents[0]).toEqual([1])
      expect(emittedEvents[1]).toEqual([2])
      expect(emittedEvents[2]).toEqual([3])
    })

    it('gère les IDs de différents types', () => {
      const testIds = [1, 'abc', null, undefined, 0]
      
      testIds.forEach(id => {
        wrapper.vm.onTrainingClick(id)
      })
      
      const emittedEvents = wrapper.emitted('trainingClick')
      expect(emittedEvents).toHaveLength(testIds.length)
      
      testIds.forEach((id, index) => {
        expect(emittedEvents[index]).toEqual([id])
      })
    })
  })

  describe('Rendu conditionnel basé sur le nombre de trainings', () => {
    it('gère un tableau vide', () => {
      expect(wrapper.vm.trainings).toEqual([])
      expect(wrapper.vm.trainings.length).toBe(0)
    })

    it('gère un tableau avec des données', async () => {
      await wrapper.setProps({ trainings: mockTrainings })
      
      expect(wrapper.vm.trainings).toEqual(mockTrainings)
      expect(wrapper.vm.trainings.length).toBe(3)
    })

    it('bascule correctement entre différents états', async () => {
      expect(wrapper.vm.trainings.length).toBe(0)

      await wrapper.setProps({ trainings: mockTrainings })
      expect(wrapper.vm.trainings.length).toBe(3)

      await wrapper.setProps({ trainings: [] })
      expect(wrapper.vm.trainings.length).toBe(0)

      await wrapper.setProps({ trainings: [mockTrainings[0]] })
      expect(wrapper.vm.trainings.length).toBe(1)
    })
  })

  describe('Gestion des props', () => {
    it('gère les valeurs par défaut', () => {
      const defaultWrapper = createWrapper()
      expect(defaultWrapper.vm.trainings).toEqual([])
      defaultWrapper.unmount()
    })

    it('accepte des trainings personnalisés', () => {
      const customTrainings = [
        { id: 'a', name: 'Custom Training' },
        { id: 'b', name: 'Another Training' }
      ]
      
      const customWrapper = createWrapper({ trainings: customTrainings })
      expect(customWrapper.vm.trainings).toEqual(customTrainings)
      customWrapper.unmount()
    })

    it('réagit aux changements dynamiques', async () => {

      expect(wrapper.vm.trainings).toEqual([])

      await wrapper.setProps({ trainings: [mockTrainings[0]] })
      expect(wrapper.vm.trainings.length).toBe(1)
      
      await wrapper.setProps({ trainings: mockTrainings.slice(0, 2) })
      expect(wrapper.vm.trainings.length).toBe(2)
      
      await wrapper.setProps({ trainings: mockTrainings })
      expect(wrapper.vm.trainings.length).toBe(3)
    })
  })

  describe('Émissions d\'événements', () => {
    it('émet trainingClick pour chaque training', () => {
      mockTrainings.forEach(training => {
        wrapper.vm.onTrainingClick(training.id)
      })
      
      const emittedEvents = wrapper.emitted('trainingClick')
      expect(emittedEvents).toHaveLength(mockTrainings.length)
      
      mockTrainings.forEach((training, index) => {
        expect(emittedEvents[index]).toEqual([training.id])
      })
    })

    it('conserve l\'ordre des émissions', () => {
      const ids = [3, 1, 2]
      
      ids.forEach(id => {
        wrapper.vm.onTrainingClick(id)
      })
      
      const emittedEvents = wrapper.emitted('trainingClick')
      expect(emittedEvents).toHaveLength(3)
      expect(emittedEvents[0]).toEqual([3])
      expect(emittedEvents[1]).toEqual([1])
      expect(emittedEvents[2]).toEqual([2])
    })

    it('n\'émet pas d\'événements non sollicités', () => {
      
      expect(wrapper.emitted('trainingClick')).toBeFalsy()

      wrapper.setProps({ trainings: mockTrainings })
      expect(wrapper.emitted('trainingClick')).toBeFalsy()
    })
  })

  describe('Cas limites', () => {
    it('gère des trainings avec propriétés manquantes', () => {
      const incompleteTrainings = [
        { id: 1 },
        { name: 'Training sans ID' },
        {}
      ]
      
      expect(() => {
        const customWrapper = createWrapper({ trainings: incompleteTrainings })
        customWrapper.unmount()
      }).not.toThrow()
    })

    it('gère des tableaux très grands', () => {
      const manyTrainings = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Training ${i + 1}`
      }))
      
      const customWrapper = createWrapper({ trainings: manyTrainings })
      expect(customWrapper.vm.trainings.length).toBe(100)
      customWrapper.unmount()
    })

    it('gère les changements rapides de props', async () => {
      await wrapper.setProps({ trainings: mockTrainings })
      await wrapper.setProps({ trainings: [] })
      await wrapper.setProps({ trainings: mockTrainings.slice(0, 1) })
      await wrapper.setProps({ trainings: mockTrainings })
      
      expect(wrapper.vm.trainings).toEqual(mockTrainings)
    })

    it('gère les objets training avec des IDs complexes', () => {
      const complexTrainings = [
        { id: { nested: 'id' }, name: 'Complex 1' },
        { id: [1, 2, 3], name: 'Complex 2' },
        { id: new Date(), name: 'Complex 3' }
      ]
      
      expect(() => {
        const customWrapper = createWrapper({ trainings: complexTrainings })
        
        complexTrainings.forEach(training => {
          customWrapper.vm.onTrainingClick(training.id)
        })
        
        customWrapper.unmount()
      }).not.toThrow()
    })
  })

  describe('Intégrité des données', () => {
    it('ne modifie pas les données d\'entrée', () => {
      const originalTrainings = JSON.parse(JSON.stringify(mockTrainings))
      const customWrapper = createWrapper({ trainings: mockTrainings })

      mockTrainings.forEach(training => {
        customWrapper.vm.onTrainingClick(training.id)
      })
      
      expect(mockTrainings).toEqual(originalTrainings)
      customWrapper.unmount()
    })
  })

  describe('Performance', () => {
    it('ne re-déclenche pas inutilement', async () => {
      const spy = vi.spyOn(wrapper.vm, 'onTrainingClick')

      await wrapper.setProps({ trainings: mockTrainings })
      await wrapper.setProps({ trainings: mockTrainings.slice(0, 2) })
      
      expect(spy).not.toHaveBeenCalled()
      
      spy.mockRestore()
    })

    it('gère efficacement les grandes listes', () => {
      const startTime = performance.now()
      
      const largeList = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Training ${i}`
      }))
      
      const customWrapper = createWrapper({ trainings: largeList })

      for (let i = 0; i < 10; i++) {
        customWrapper.vm.onTrainingClick(i)
      }
      
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100)
      
      customWrapper.unmount()
    })
  })

  describe('API du composant', () => {
    it('expose les bonnes props', () => {
      const props = Object.keys(wrapper.vm.$props)
      expect(props).toContain('trainings')
    })

    it('expose les bonnes méthodes', () => {
      expect(typeof wrapper.vm.onTrainingClick).toBe('function')
    })

    it('a les bons émetteurs configurés', () => {
      // Vérifier que le composant peut émettre trainingClick
      wrapper.vm.onTrainingClick(1)
      expect(wrapper.emitted()).toHaveProperty('trainingClick')
    })
  })

  describe('Validation de la structure', () => {
    it('est un composant Vue valide', () => {
      expect(wrapper.vm.$options).toBeDefined()
      expect(wrapper.vm.$props).toBeDefined()
      expect(wrapper.vm.$emit).toBeDefined()
    })

    it('maintient la réactivité', async () => {
      const initialLength = wrapper.vm.trainings.length
      
      await wrapper.setProps({ trainings: mockTrainings })
      
      expect(wrapper.vm.trainings.length).not.toBe(initialLength)
      expect(wrapper.vm.trainings.length).toBe(mockTrainings.length)
    })
  })
})