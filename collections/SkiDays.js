var app = app || {};

(function() {

	var SkiDays = Backbone.Collection.extend({

		model: app.SkiDay,
		localStorage: new Backbone.LocalStorage('skidays'),

		getById: function(id) {
			return this.where({id: id});
		}

	});

	app.skiDays = new SkiDays();

})();