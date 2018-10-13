import mongoose from 'mongoose';

// @TODO: Придумать норвальное решение без паралельного сохранения одного документа
// В mongoose v5 был добавлена защита от параллельного сохранения одного документа
// Пока решения лучше не предумал. Будем ее обходить
// Так что, что бы было интереснее дебажить - отключим ее
const modelSave  = mongoose.Model.prototype.save;
mongoose.Model.prototype.save = function (...args) {
	this.$__.saving = false;
	return modelSave.apply(this, args);
};

export default mongoose;
