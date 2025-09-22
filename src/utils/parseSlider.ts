export const parseSlider = (slider: string) => {
  return slider
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '')
}
