var app = app || {};

(function(app) {

	app.Participant = Backbone.Model.extend({

		defaults: {
			name: '',
			isClubMember: true,
			numSkis: 0,
			numEquipmentHires: 0,
			numGuestsBrought: 0,
			totalDiscount: 0.0,
			skiDayId: null,
			totalPayable: 0
		},

		toggleIsClubMember: function() {
			this.save({
				isClubMember: !this.get('isClubMember')
			});
		}

	});

})(app);