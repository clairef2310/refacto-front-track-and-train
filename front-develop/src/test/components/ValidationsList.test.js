import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ValidationsList from '@/components/ValidationsList.vue'

vi.mock('@/stores/training', () => ({
  useTrainingStore: () => ({
    loading: { creating: false },
    deleteValidation: vi.fn().mockResolvedValue(true),
  }),
}))

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('ValidationsList.vue', () => {
  let wrapper
  const defaultProps = {
    validations: [
      {
        id: '1',
        set_number: 3,
        repetitions: 12,
        rest_time: 2,
        rir: 2,
        calculated_difficulty: 5,
        notes: 'Bonne séance',
        succeeded_at: new Date().toISOString(),
      },
    ],
    loading: false,
    taskName: 'Squat',
    trainingId: 'training-1',
    taskId: 'task-1',
  }

  beforeEach(() => {
    wrapper = mount(ValidationsList, {
      props: defaultProps,
      global: {
        stubs: {
          'v-icon': true,
          'v-spacer': true,
          'v-card': true,
          'v-card-text': true,
          'v-card-title': true,
          'v-col': true,
          'v-row': true,
          'v-chip': true,
          'v-btn': true,
          'v-dialog': true,
          'v-progress-circular': true,
          'VTextField': true,
          PrimaryButton: true,
          SecondaryButton: true,
          TertiaryButton: true,
          DeleteButton: true,
          DeleteConfirmationDialog: true,
        },
      },
    })
  })

  it('affiche le titre de la liste des validations', () => {
    expect(wrapper.text()).toContain('Historique des validations - Squat')
  })

  it('affiche le message "aucune validation" si la liste est vide', async () => {
    await wrapper.setProps({ validations: [] })
    expect(wrapper.text()).toContain("Aucune validation pour cet exercice")
  })

  it('calcule correctement les statistiques', () => {
    const avgReps = wrapper.vm.averageReps
    const avgRir = wrapper.vm.averageRir
    const avgDifficulty = wrapper.vm.averageDifficulty

    expect(avgReps).toBe(12)
    expect(avgRir).toBe(2)
    expect(avgDifficulty).toBe(5)
  })

  it('ouvre le dialog de date picker et applique un filtre', async () => {
    wrapper.vm.openDatePicker()
    expect(wrapper.vm.datePickerDialog).toBe(true)

    const dates = [new Date().toISOString().split('T')[0]]
    wrapper.vm.onDatePickerChange(dates)
    wrapper.vm.applyDateFilter()

    expect(wrapper.vm.dateRange).toEqual(dates)
    expect(wrapper.vm.datePickerDialog).toBe(false)
  })

  it('ouvre le delete dialog et supprime une validation', async () => {
    wrapper.vm.openDeleteDialog(defaultProps.validations[0])
    expect(wrapper.vm.deleteDialog).toBe(true)

    await wrapper.vm.confirmDelete()
    expect(wrapper.vm.deleteDialog).toBe(false)
    expect(wrapper.vm.selectedValidation).toBe(null)
  })

  it('permet de naviguer entre les slides', async () => {
    wrapper.vm.filteredValidations.push({
      ...defaultProps.validations[0],
      id: '2',
    })
    wrapper.vm.slidesPerView = 1
    wrapper.vm.nextSlide()
    expect(wrapper.vm.currentSlide).toBe(1)

    wrapper.vm.prevSlide()
    expect(wrapper.vm.currentSlide).toBe(0)
  })
})
